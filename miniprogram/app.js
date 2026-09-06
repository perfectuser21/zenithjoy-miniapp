// app.js
//
// 这个小程序只做一件事：让人在手机上把素材传进 ZenithJoy 素材库、并且看得见。
// 数据全部走中台 HTTPS（见 utils/zj-api.js），**不使用微信云开发**——
// 2026-09-06 起云函数那条路已废弃：中台域名进了合法域名之后，中转那一跳
// 只剩坏处。原来 onLaunch 里的 wx.cloud.init + initDatabase 云函数调用，
// 正是手机上「初始化失败」弹窗的来源。
//
// 之前那版 AI 助理形态的小程序保留在 tag ai-assistant-v1，将来想用直接取。

App({
  onLaunch() {
    this.globalData = {
      privacyResolve: null,    // 隐私授权 resolve 函数（onNeedPrivacyAuthorization 注入）
      needPrivacyModal: false, // 是否需要弹出隐私弹窗
      env: wx.getAccountInfoSync().miniProgram.envVersion || 'release'
    }

    // 隐私协议授权回调（微信 2.33.0+ 审核强制要求）
    if (wx.onNeedPrivacyAuthorization) {
      wx.onNeedPrivacyAuthorization(resolve => {
        this.globalData.privacyResolve = resolve
        this.globalData.needPrivacyModal = true
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        if (currentPage && typeof currentPage.showPrivacyModal === 'function') {
          currentPage.showPrivacyModal()
        }
      })
    }

    wx.onError((error) => {
      console.error('全局错误:', error)
    })
  },

  onError(err) {
    console.error('应用发生错误:', err)
  },

  onPageNotFound() {
    // 页面不存在时回素材库（tabBar 页只能用 switchTab）
    wx.switchTab({ url: '/pages/materials/materials' })
  }
})
