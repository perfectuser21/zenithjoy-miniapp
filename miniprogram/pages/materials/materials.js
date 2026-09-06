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
    preview: null
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

  onTapItem(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.items.filter((x) => x.id === id)[0]
    if (!item) return
    if (item.video) {
      wx.showToast({ title: '视频暂不支持预览', icon: 'none' })
      return
    }
    if (!item.previewUrl) {
      wx.showToast({ title: '这条预览地址签发失败', icon: 'none' })
      return
    }
    this.setData({ preview: item })
  },

  onClosePreview() {
    this.setData({ preview: null })
  },

  onRetry() {
    this.load()
  }
})
