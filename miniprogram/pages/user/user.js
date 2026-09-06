// 我的 — 这个小程序只需要一样东西：你自己的上传凭据
//
// 凭据 = ZenithJoy 账号的 license key，和 iPhone 快捷指令里配的是同一个。
// 它只存在这台手机上（wx storage），不上传、不进代码。换手机要重填一次。
//
// ── 2026-09-06 真机教训：别让人在手机上敲这串东西 ──────────────────────
// 第一版只放了一个输入框，真机上「敲进去看不见」——深色模式下微信把原生
// <input> 的文字渲染成浅色，压在浅灰底上等于隐形。两条修法：
//   ① 主路径改成「粘贴并验证」。凭据本来就是复制来的，手机上一个字一个字敲
//      本身就是坏设计，改掉之后连配色问题都不存在了。
//   ② 手动输入保留，但把输进去的内容用 <text> 明文回显。<text> 是小程序自己
//      画的，不受原生组件配色影响，一定看得见。
//
// ── 为什么填一次就够 ──────────────────────────────────────────────────
// 中台从凭据反查租户，客户端永远不自报身份。填对了就只看得到自己的素材，
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
    echo: '',         // 明文回显：原生输入框看不见时，靠这一行确认输对了没有
    apiBase: '',
    checking: false,
    checkResult: ''   // 验证结果的人话描述
  },

  onShow() {
    this.setData({
      saved: mask(api.getToken()),
      input: '',
      echo: '',
      checkResult: '',
      apiBase: api.apiBase()
    })
  },

  onInput(e) {
    const v = e.detail.value || ''
    this.setData({ input: v, echo: v })
  },

  /**
   * 手机上的主路径：凭据是复制过来的，直接从剪贴板取，一步到位。
   * 不经过输入框，也就绕开了「敲进去看不见」这件事。
   */
  onPaste() {
    return new Promise((resolve) => {
      wx.getClipboardData({
        success: (res) => {
          const v = String((res && res.data) || '').trim()
          if (!v) {
            wx.showToast({ title: '剪贴板是空的，先复制你的 license key', icon: 'none' })
            resolve()
            return
          }
          this.setData({ input: v, echo: v })
          this.verifyAndSave(v).then(resolve)
        },
        fail: () => {
          wx.showToast({ title: '读不到剪贴板', icon: 'none' })
          resolve()
        }
      })
    })
  },

  onSave() {
    const v = (this.data.input || '').trim()
    if (!v) {
      wx.showToast({ title: '先把凭据填进去', icon: 'none' })
      return Promise.resolve()
    }
    return this.verifyAndSave(v)
  },

  /**
   * 存之前先验：填完立刻打一次中台，当场告诉他行不行。
   * 只存不验会让人以为填好了，等到上传时才发现是错的。
   */
  verifyAndSave(token) {
    api.setToken(token)
    this.setData({ checking: true, checkResult: '' })

    return api.listMaterials({ limit: 1 })
      .then((r) => {
        const n = r.total != null ? r.total : (r.items || []).length
        this.setData({
          checking: false,
          saved: mask(api.getToken()),
          input: '',
          echo: '',                 // 验过就把明文收起来，别一直摆在屏幕上
          checkResult: '✅ 凭据有效，素材库里现在有 ' + n + ' 条'
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
        this.setData({ saved: '', input: '', echo: '', checkResult: '' })
        wx.showToast({ title: '已清除', icon: 'none' })
      }
    })
  },

  onGoMaterials() {
    wx.switchTab({ url: '/pages/materials/materials' })
  }
})
