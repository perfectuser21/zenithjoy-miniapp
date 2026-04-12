// app.js
App({
  onLaunch() {
    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'zenithjoycloud-8g4ca5pbb5b027e8',
        traceUser: true,
      })
    }
    
    // 隐私协议授权处理（微信审核要求）
    this.initPrivacyAuthorization();

    // 自动初始化数据库
    this.initDatabaseCollections();

    // 添加网络请求白名单（仅在开发环境中有效）
    this.setRequestDomains();
    
    this.globalData = {
      userInfo: null,
      hasUserInfo: false,
      hasLogin: false,
      privacyAgreed: false,
      env: wx.getAccountInfoSync().miniProgram.envVersion || 'release'
    };
    
    // 监听错误
    wx.onError((error) => {
      console.error('全局错误:', error);
    });
  },

  // 初始化隐私协议授权监听
  initPrivacyAuthorization() {
    if (!wx.onNeedPrivacyAuthorization) return;
    wx.onNeedPrivacyAuthorization((resolve) => {
      // 通知当前页面显示隐私弹窗
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && typeof currentPage.showPrivacyPopup === 'function') {
        currentPage.showPrivacyPopup(resolve);
      } else {
        // 降级：直接同意（无弹窗页面时）
        resolve({ buttonId: 'agree-btn', event: 'agree' });
      }
    });
  },
  
  // 设置请求域名白名单（开发环境使用）
  setRequestDomains() {
    const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
    if (envVersion === 'develop') {
      wx.setRequestDomains && wx.setRequestDomains({
        requestDomains: [
          'https://api.coze.cn',
          'https://servicewechat.com'
        ],
        success(res) {
          console.log('设置请求域名白名单成功', res)
        },
        fail(err) {
          console.error('设置请求域名白名单失败', err)
        }
      });
    }
  },
  
  // 初始化数据库集合
  initDatabaseCollections() {
    wx.cloud.callFunction({
      name: 'initDatabase',
      success: (res) => {
        if (res.result && res.result.result) {
          const dbResult = res.result.result;
          if (dbResult.errors && dbResult.errors.length > 0) {
            console.warn('数据库初始化有部分错误:', dbResult.errors)
          }
        }
      },
      fail: (err) => {
        if (err.errCode !== -404) {
          wx.showToast({
            title: '数据库初始化失败',
            icon: 'none'
          })
        }
      }
    })
  },
  
  // 全局错误处理
  onError(err) {
    console.error('应用发生错误:', err);
  },
  
  // 页面找不到处理
  onPageNotFound(res) {
    wx.reLaunch({
      url: '/pages/index/index'
    });
    console.error('页面不存在:', res.path);
  }
})
