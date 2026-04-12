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

    this.globalData = {
      userInfo: null,
      hasUserInfo: false,
      hasLogin: false,
      privacyResolve: null,    // 隐私授权 resolve 函数（onNeedPrivacyAuthorization 注入）
      needPrivacyModal: false, // 是否需要弹出隐私弹窗
      env: wx.getAccountInfoSync().miniProgram.envVersion || 'release'
    };

    // 注册隐私协议授权回调（微信 2.33.0+ 审核强制要求）
    // 触发时机：用户第一次调用需要隐私授权的 API（如 getUserProfile 等）
    if (wx.onNeedPrivacyAuthorization) {
      wx.onNeedPrivacyAuthorization(resolve => {
        this.globalData.privacyResolve = resolve;
        this.globalData.needPrivacyModal = true;
        // 通知当前页面显示隐私弹窗
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        if (currentPage && typeof currentPage.showPrivacyModal === 'function') {
          currentPage.showPrivacyModal();
        }
      });
    }

    // 自动初始化数据库
    this.initDatabaseCollections();

    // 添加网络请求白名单（仅在开发环境中有效）
    this.setRequestDomains();

    // 监听错误
    wx.onError((error) => {
      console.error('全局错误:', error);
    });
  },
  
  // 设置请求域名白名单（开发环境使用）
  setRequestDomains() {
    // 开发环境
    const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
    if (envVersion === 'develop') {
      console.log('开发环境，扩展网络请求白名单');
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
    console.log('开始初始化数据库...')
    wx.cloud.callFunction({
      name: 'initDatabase',
      success: (res) => {
        console.log('数据库初始化成功:', res.result)
        if (res.result && res.result.result) {
          const dbResult = res.result.result;
          
          // 检查是否有错误
          if (dbResult.errors && dbResult.errors.length > 0) {
            console.warn('数据库初始化有部分错误:', dbResult.errors)
          }
          
          // 显示初始化结果
          const createdCollections = dbResult.collections.filter(c => c.created).map(c => c.name);
          if (createdCollections.length > 0) {
            console.log('新创建的集合:', createdCollections.join(', '))
          }
        }
      },
      fail: (err) => {
        console.error('数据库初始化失败:', err)
        // 在错误严重时通知用户
        if (err.errCode !== -404) { // 忽略函数不存在的错误
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
    // 处理全局错误
    console.error('应用发生错误:', err);
  },
  
  // 页面找不到处理
  onPageNotFound(res) {
    // 页面不存在时重定向到首页
    wx.reLaunch({
      url: '/pages/index/index'
    });
    console.error('页面不存在:', res.path);
  }
}) 