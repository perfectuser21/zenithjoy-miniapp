// 我的 — 这个小程序只需要一样东西：你自己的上传凭据
//
// 凭据 = ZenithJoy 账号的 license key，和 iPhone 快捷指令里配的是同一个。
// 它只存在这台手机上（wx storage），不上传、不进代码。换手机要重填一次。
//
// ── 为什么填一次就够 ──────────────────────────────────────────────────
// 中台从凭据反查租户，客户端永远不自报身份。所以填对了就只看得到自己的素材，
// 填错了看到的是「中台不认这个凭据」，不会串到别人的库里去。

const api = require('../../utils/zj-api.js')

/** 只显示头尾，中间打码——截图发给别人时不至于把凭据一起发出去 */
function mask(token) {
  if (!token) return ''
  if (token.length <= 8) return token
  return token.slice(0, 5) + '····' + token.slice(-3)
}

Page({
  data: {
    saved: '',        // 已保存的凭据（打码后）
    input: '',        // 输入框里的
    checking: false,
    checkResult: ''   // 验证结果的人话描述
  },

  onShow() {
    const t = api.getToken()
    this.setData({ saved: mask(t), input: '', checkResult: '', apiBase: api.apiBase() })
  },

  onInput(e) {
    this.setData({ input: e.detail.value })
  },

  /**
   * 保存即验证：填完立刻打一次中台，当场告诉他行不行。
   * 只存不验会让人以为填好了，等到上传时才发现是错的。
   */
  onSave() {
    const v = (this.data.input || '').trim()
    if (!v) {
      wx.showToast({ title: '先把凭据填进去', icon: 'none' })
      return
    }
    api.setToken(v)
    this.setData({ checking: true, checkResult: '' })

    api.listMaterials({ limit: 1 })
      .then((r) => {
        this.setData({
          checking: false,
          saved: mask(api.getToken()),
          input: '',
          checkResult: '✅ 凭据有效，素材库里现在有 ' + (r.total != null ? r.total : r.items.length) + ' 条'
        })
      })
      .catch((e) => {
        // 验不过就把刚存的清掉，别留一个坏凭据让人以为已经配好了
        api.clearToken()
        this.setData({
          checking: false,
          saved: '',
          checkResult: '❌ ' + (e.code || 'FAILED') + '：' + (e.message || '验证失败')
        })
      })
  },

  onClear() {
    wx.showModal({
      title: '清除凭据',
      content: '清掉之后就看不到素材了，要重新填才行。',
      success: (res) => {
        if (!res.confirm) return
        api.clearToken()
        this.setData({ saved: '', input: '', checkResult: '' })
        wx.showToast({ title: '已清除', icon: 'none' })
      }
    })
  },

  onGoMaterials() {
    wx.switchTab({ url: '/pages/materials/materials' })
  }
})
