/**
 * 微信小程序 wx 全局 API Mock
 * 为 jest 单元测试提供 wx.* API 的基础 stub
 */
global.wx = {
  cloud: {
    callFunction: jest.fn(() => Promise.resolve({ result: { success: true, data: [] } })),
    database: jest.fn(() => ({
      collection: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        get: jest.fn(() => Promise.resolve({ data: [] }))
      }))
    }))
  },
  getStorage: jest.fn(({ success } = {}) => success && success({ data: null })),
  setStorage: jest.fn(({ success } = {}) => success && success()),
  removeStorage: jest.fn(({ success } = {}) => success && success()),
  clearStorageSync: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(({ success } = {}) => success && success({ confirm: true })),
  navigateTo: jest.fn(),
  navigateBack: jest.fn(),
  redirectTo: jest.fn(),
  updateShareMenu: jest.fn(({ success } = {}) => success && success()),
  setNavigationBarTitle: jest.fn(),
  stopPullDownRefresh: jest.fn(),
  previewImage: jest.fn(),
  getUserProfile: jest.fn(),
  login: jest.fn(({ success } = {}) => success && success({ code: 'test-code' })),
  request: jest.fn(() => Promise.resolve({ data: {} }))
}

/**
 * 模拟 Page() 注册机制，捕获页面配置供测试使用
 * 调用 require(pageFile) 后，通过 global.__lastPage 获取页面对象
 */
let _lastPage = null
global.Page = function (config) {
  _lastPage = config
  return config
}
global.__getLastPage = () => _lastPage
global.__resetPage = () => { _lastPage = null }

global.Component = function (config) {
  return config
}

global.App = function (config) {
  return config
}

global.getApp = jest.fn(() => ({
  globalData: {
    userInfo: null,
    openid: null
  }
}))
