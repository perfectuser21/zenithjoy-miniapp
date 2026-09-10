// 发布作品 — 上传完的素材在这里编好标题/文案、勾上平台，一键进发布队列
//
// 链路：上传 complete 落库时中台建了作品（content）→ 本页按 content_id 找出来预填
//       → 客户改内容勾平台 → PATCH 存回去 → POST publish 进队列 → 真机 worker
//       发出去，回执回写在作品身上。
//
// ── 两条纪律 ──────────────────────────────────────────────────────────
// ① 发布是两步（先存内容再进队列），哪一步失败提示必须不一样：
//    PATCH 失败 = 还没进队列，改动没存上，可直接重试；
//    publish 失败 = 内容已存成草稿，白填不了，稍后再发就行。
//    糊成一句「发布失败」客户不知道刚填的东西还在不在。
// ② 不做定时发布——中台到点派发的 worker 还没建，摆一个不生效的选项
//    比没有更糟（客户以为定上了，实际永远不会发）。

const api = require('../../utils/zj-api.js')

// 九平台写死在端上：这是发布页的选项清单，不是能力探测。
// 顺序按客户使用频率排，key 与中台 platforms 字段一致。
const PLATFORMS = [
  { key: 'douyin', label: '抖音' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'kuaishou', label: '快手' },
  { key: 'shipinhao', label: '视频号' },
  { key: 'toutiao', label: '头条' },
  { key: 'weibo', label: '微博' },
  { key: 'bilibili', label: 'B站' },
  { key: 'zhihu', label: '知乎' },
  { key: 'wechat', label: '公众号' }
]

/** 视频不出缩略图，同素材库：抽帧转码是另一件事，占位即可 */
function isVideo(item) {
  if (item.type === 'video') return true
  if (item.mime_type && item.mime_type.indexOf('video/') === 0) return true
  return false
}

Page({
  data: {
    contentId: '',
    loading: true,
    errorMessage: '',
    needToken: false,
    previewUrl: '',
    video: false,
    title: '',
    body: '',
    // 每条：{ key, label, checked }
    platforms: [],
    selectedCount: 0,
    publishing: false
  },

  onLoad(query) {
    this.setData({ contentId: String((query && query.content_id) || '').trim() })
    this.load()
  },

  load() {
    const id = this.data.contentId
    if (!id) {
      // 没带 content_id 就进来了（比如直接扫码进页）——空表单让人白填一遍才是最坑的
      this.setData({ loading: false, errorMessage: '没有指定要发哪个作品。从上传页或作品列表进来。' })
      return
    }
    this.setData({ loading: true, errorMessage: '', needToken: false })

    // 中台没有单条 GET 端点，先列后找。limit 取默认 60：作品刚建完必然在最前面
    api.listContents({ limit: 60 })
      .then((r) => {
        const item = (r.items || []).filter((x) => x.id === id)[0]
        if (!item) {
          this.setData({ loading: false, errorMessage: '找不到这个作品（可能已被删除或不在最近 60 条里）' })
          return
        }
        const picked = item.platforms || []
        this.setData({
          loading: false,
          previewUrl: item.preview_url || '',
          video: isVideo(item),
          title: item.title || '',
          body: item.body || '',
          platforms: PLATFORMS.map((p) => ({
            key: p.key,
            label: p.label,
            checked: picked.indexOf(p.key) !== -1
          })),
          selectedCount: PLATFORMS.filter((p) => picked.indexOf(p.key) !== -1).length
        })
      })
      .catch((e) => {
        this.setData({
          loading: false,
          errorMessage: (e.code || 'UNKNOWN') + '：' + (e.message || '读取作品失败'),
          needToken: e.code === 'NO_TOKEN' || e.code === 'BAD_TOKEN'
        })
      })
  },

  onGoToken() {
    wx.switchTab({ url: '/pages/user/user' })
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  onBodyInput(e) {
    this.setData({ body: e.detail.value })
  },

  onTogglePlatform(e) {
    const key = e.currentTarget.dataset.key
    const platforms = this.data.platforms.map((p) =>
      p.key === key ? { key: p.key, label: p.label, checked: !p.checked } : p
    )
    this.setData({
      platforms: platforms,
      selectedCount: platforms.filter((p) => p.checked).length
    })
  },

  async onPublish() {
    if (this.data.publishing) return
    const id = this.data.contentId
    const picked = this.data.platforms.filter((p) => p.checked).map((p) => p.key)
    if (!picked.length) {
      // 本地就拦住，不浪费一个请求——中台拒了报的错还得让客户猜
      wx.showToast({ title: '至少选一个平台', icon: 'none' })
      return
    }

    this.setData({ publishing: true })

    // 第一步：把标题/文案/平台存回作品。失败 = 什么都没发生，可直接重试
    try {
      await api.patchContent(id, { title: this.data.title, body: this.data.body, platforms: picked })
    } catch (e) {
      this.setData({ publishing: false })
      wx.showModal({
        title: '还没进发布队列，可重试',
        content: e.message || '保存内容失败',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    // 第二步：进发布队列。失败时内容已经在第一步存成草稿了——必须说清这一点
    try {
      await api.publishContent(id)
    } catch (e) {
      this.setData({ publishing: false })
      wx.showModal({
        title: '草稿已保存，暂时没发出去',
        content: e.message || '进发布队列失败',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    this.setData({ publishing: false })
    wx.showModal({
      title: '已进发布队列',
      content: '已进发布队列，真机发完可在作品列表看回执。',
      showCancel: false,
      confirmText: '好',
      success: () => wx.navigateBack()
    })
  },

  onRetry() {
    this.load()
  }
})
