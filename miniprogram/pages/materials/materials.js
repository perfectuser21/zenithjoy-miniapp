// 素材库 — 手机上看 iPhone 快捷指令 / 电脑 agent 传上来的素材
//
// 数据链路：本页 → 云函数 listMaterials → ZenithJoy 中台 GET /api/materials → COS
// 中台凭据只在云函数的环境变量里，本页永远接触不到。
//
// ── 一条纪律：读不到就说清楚为什么 ───────────────────────────────────────
// 云函数没部署、环境变量没配、中台连不上——这些都会让列表是空的，但原因完全
// 不同。直接显示一个空九宫格会让人以为「素材丢了」。所以每种失败都把云函数
// 返回的 code/message 摆出来。

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
    preview: null
  },

  onLoad() {
    this.load()
  },

  onPullDownRefresh() {
    this.load(() => wx.stopPullDownRefresh())
  },

  load(done) {
    this.setData({ loading: true, errorCode: '', errorMessage: '' })

    wx.cloud.callFunction({
      name: 'listMaterials',
      data: { limit: PAGE_SIZE },
      success: (res) => {
        const r = (res && res.result) || {}
        if (!r.ok) {
          // 把云函数给的原因原样显示——它已经区分了「没配置」「连不上」「凭据被拒」
          this.setData({
            loading: false,
            items: [],
            errorCode: r.code || 'UNKNOWN',
            errorMessage: r.message || '读取素材失败'
          })
          return
        }
        const items = (r.items || []).map((m) => ({
          id: m.id,
          fileName: m.file_name,
          sizeText: formatSize(m.size_bytes),
          video: isVideo(m),
          // preview_url 为 null 表示中台签名失败——显示占位，绝不塞进 image src
          previewUrl: m.preview_url || ''
        }))
        this.setData({ loading: false, items: items })
      },
      fail: (err) => {
        // 云函数根本没部署时走这里。这是当前最可能的失败，要说人话。
        this.setData({
          loading: false,
          items: [],
          errorCode: 'CLOUD_CALL_FAILED',
          errorMessage: '调不到云函数 listMaterials（可能还没部署到云环境）：' +
            ((err && err.errMsg) || '未知错误')
        })
      },
      complete: () => { if (typeof done === 'function') done() }
    })
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
