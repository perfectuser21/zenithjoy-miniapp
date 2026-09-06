// 素材库 — 手机上看 iPhone 快捷指令 / 电脑 agent / 本小程序传上来的素材
//
// 数据链路：本页 → wx.request 直连 ZenithJoy 中台 GET /api/materials → COS 预签名预览。
// 凭据是客户自己在「我的」填的 license key，存在他自己手机上（utils/zj-api.js）。
//
// ── 一条纪律：读不到就说清楚为什么 ───────────────────────────────────────
// 没填凭据、凭据不对、中台连不上——这些都会让列表是空的，但原因和该做的事完全
// 不同。直接显示一个空九宫格会让人以为「素材丢了」。所以每种失败都摆出原因，
// 而且「没填凭据」这一种要直接给一个能点的按钮送人去填。

const api = require('../../utils/zj-api.js')

const PAGE_SIZE = 60

/** 视频不出缩略图（抽帧转码是另一件事），只显示图标。mime 不可靠时看扩展名。 */
function isVideo(item) {
  if (item.mime_type && item.mime_type.indexOf('video/') === 0) return true
  return /\.(mp4|mov|m4v|avi|mkv|webm|3gp)$/i.test(item.file_name || '')
}

function formatSize(bytes) {
  const n = Number(bytes)
  if (!isFinite(n) || n < 0) return '-'
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB'
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB'
  return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

Page({
  data: {
    loading: true,
    items: [],
    errorCode: '',
    errorMessage: '',
    needToken: false,     // 没填凭据：错误区要显示「去填凭据」按钮
    preview: null,
    previewShowsImage: false
  },

  // tabBar 页用 onShow：从「我的」填完凭据切回来要能立刻看到东西
  onShow() {
    this.load()
  },

  onPullDownRefresh() {
    this.load(() => wx.stopPullDownRefresh())
  },

  load(done) {
    this.setData({ loading: true, errorCode: '', errorMessage: '', needToken: false })

    api.listMaterials({ limit: PAGE_SIZE })
      .then((r) => {
        const items = (r.items || []).map((m) => ({
          id: m.id,
          fileName: m.file_name,
          sizeText: formatSize(m.size_bytes),
          video: isVideo(m),
          // preview_url 为 null 表示中台签名失败——显示占位，绝不塞进 image src
          previewUrl: m.preview_url || ''
        }))
        this.setData({ loading: false, items: items })
      })
      .catch((e) => {
        this.setData({
          loading: false,
          items: [],
          errorCode: e.code || 'UNKNOWN',
          errorMessage: e.message || '读取素材失败',
          needToken: e.code === 'NO_TOKEN' || e.code === 'BAD_TOKEN'
        })
      })
      .then(() => { if (typeof done === 'function') done() })
  },

  onGoToken() {
    wx.switchTab({ url: '/pages/user/user' })
  },

  /**
   * 点开。视频和预览签失败的那些**照样要能点开**——原来这两种弹个 toast 就
   * 打发了，结果它们只能靠长按删，等于删不了。大图里看不看得到图是一回事，
   * 能不能对它做操作是另一回事。
   */
  onTapItem(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.items.filter((x) => x.id === id)[0]
    if (!item) return
    this.setData({
      preview: item,
      // 有可用预览才渲染 image；否则大图区显示占位，但按钮照样在
      previewShowsImage: Boolean(!item.video && item.previewUrl)
    })
  },

  onClosePreview() {
    this.setData({ preview: null, previewShowsImage: false })
  },

  /**
   * 点开大图里的删除按钮。
   *
   * 长按是隐藏手势——没人会去猜它存在。删除的主入口必须是点开之后看得见的
   * 一个按钮，长按只是给熟了以后图快的人留的快捷方式。
   */
  onDeletePreview() {
    const item = this.data.preview
    if (!item) return
    this.confirmRemove(item)
  },

  /**
   * 长按删（快捷方式）。删是不可逆的，所以两条：
   *   ① 必须二次确认，而且确认框里要写清删的是哪一个文件
   *   ② 删完不整页重刷，只把这一格从列表里摘掉——重刷会让人失去位置，
   *      而且要重新签一遍所有预览 URL
   */
  onLongPressItem(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.items.filter((x) => x.id === id)[0]
    if (!item) return
    this.confirmRemove(item)
  },

  confirmRemove(item) {
    wx.showModal({
      title: '删掉这个素材',
      content: item.fileName + '\n删了就没了，存储里的原文件也会一起删掉。',
      confirmText: '删掉',
      confirmColor: '#c0392b',
      success: (res) => {
        if (!res.confirm) return
        this.remove(item.id, item.fileName)
      }
    })
  },

  remove(id, fileName) {
    wx.showLoading({ title: '删除中…', mask: true })
    api.deleteMaterial(id)
      .then(() => {
        wx.hideLoading()
        this.setData({
          items: this.data.items.filter((x) => x.id !== id),
          preview: null
        })
        wx.showToast({ title: '已删掉', icon: 'none' })
      })
      .catch((err) => {
        wx.hideLoading()
        // 中台已经区分了「被已发布作品用着」「存储没删掉」，原样显示。
        // 弹窗而不是 toast：toast 一行放不下「被哪个作品挡着」这种话。
        wx.showModal({
          title: '没删掉：' + fileName,
          content: err.message || '删除失败',
          showCancel: false,
          confirmText: '知道了'
        })
      })
  },

  onRetry() {
    this.load()
  }
})
