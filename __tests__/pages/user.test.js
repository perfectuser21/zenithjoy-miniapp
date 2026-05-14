/**
 * user 页面单元测试 — 用户认证模块
 */

require('../../miniprogram/pages/user/user')
const userConfig = global.__getLastPage()

describe('user 页面', () => {
  let page

  beforeEach(() => {
    jest.clearAllMocks()
    page = {
      ...userConfig,
      data: {
        userInfo: {},
        hasUserInfo: false,
        canIUseGetUserProfile: false,
        isAdmin: false,
        statusBarHeight: 20,
        phoneNumber: '',
        membership: { level: 'free', name: '成长会员', expireDate: null }
      },
      setData(updates) {
        Object.assign(this.data, updates)
      }
    }
  })

  describe('初始数据', () => {
    it('hasUserInfo 默认为 false', () => {
      expect(userConfig.data.hasUserInfo).toBe(false)
    })

    it('isAdmin 默认为 false', () => {
      expect(userConfig.data.isAdmin).toBe(false)
    })

    it('membership.level 默认为 free', () => {
      expect(userConfig.data.membership.level).toBe('free')
    })

    it('phoneNumber 默认为空字符串', () => {
      expect(userConfig.data.phoneNumber).toBe('')
    })
  })

  describe('onLoad', () => {
    it('调用 getSystemInfoSync 获取状态栏高度', () => {
      wx.getSystemInfoSync.mockReturnValueOnce({ statusBarHeight: 44 })
      page.checkUserInfo = jest.fn(() => Promise.resolve())
      page.checkAdminStatus = jest.fn(() => Promise.resolve())

      page.onLoad.call(page, {})

      expect(wx.getSystemInfoSync).toHaveBeenCalled()
      expect(page.data.statusBarHeight).toBe(44)
    })

    it('getSystemInfoSync 失败时不抛出', () => {
      wx.getSystemInfoSync.mockImplementationOnce(() => { throw new Error('fail') })
      page.checkUserInfo = jest.fn(() => Promise.resolve())
      page.checkAdminStatus = jest.fn(() => Promise.resolve())

      expect(() => page.onLoad.call(page, {})).not.toThrow()
    })

    it('设置 canIUseGetUserProfile 当 wx.getUserProfile 存在', () => {
      wx.getUserProfile = jest.fn()
      page.checkUserInfo = jest.fn(() => Promise.resolve())
      page.checkAdminStatus = jest.fn(() => Promise.resolve())

      page.onLoad.call(page, {})

      expect(page.data.canIUseGetUserProfile).toBe(true)
    })
  })

  describe('checkUserInfo', () => {
    it('本地有 userInfo 时设置 hasUserInfo=true', async () => {
      const mockUserInfo = { nickName: '测试用户', avatarUrl: '' }
      wx.getStorageSync.mockReturnValueOnce(mockUserInfo)
      wx.cloud.callFunction.mockResolvedValue({
        result: { openid: 'test-openid' }
      })
      // DB query for phone number
      const mockDb = {
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          get: jest.fn(() => Promise.resolve({ data: [] }))
        }))
      }
      wx.cloud.database.mockReturnValueOnce(mockDb)

      await page.checkUserInfo.call(page)

      expect(page.data.hasUserInfo).toBe(true)
      expect(page.data.profileName).toBe('测试用户')
    })

    it('本地无 userInfo 时 hasUserInfo=false', async () => {
      wx.getStorageSync.mockReturnValueOnce(null)

      await page.checkUserInfo.call(page)

      expect(page.data.hasUserInfo).toBe(false)
    })
  })

  describe('checkAdminStatus', () => {
    it('checkAdmin 返回 isAdmin=true 时更新数据', async () => {
      wx.cloud.callFunction.mockImplementation(({ success }) => {
        success({ result: { isAdmin: true } })
      })

      await page.checkAdminStatus.call(page)

      expect(page.data.isAdmin).toBe(true)
    })

    it('checkAdmin 返回 isAdmin=false 时更新数据', async () => {
      wx.cloud.callFunction.mockImplementation(({ success }) => {
        success({ result: { isAdmin: false } })
      })

      await page.checkAdminStatus.call(page)

      expect(page.data.isAdmin).toBe(false)
    })

    it('checkAdmin 失败时默认 isAdmin=false 且不抛出', async () => {
      wx.cloud.callFunction.mockImplementation(({ fail }) => {
        fail(new Error('网络错误'))
      })

      await expect(page.checkAdminStatus.call(page)).resolves.toBe(false)
      expect(page.data.isAdmin).toBe(false)
    })
  })

  describe('clearCache', () => {
    it('确认清除缓存后重置用户状态', () => {
      wx.showModal.mockImplementation(({ success }) => success({ confirm: true }))
      page.data.hasUserInfo = true
      page.data.phoneNumber = '13800138000'

      page.clearCache.call(page)

      expect(wx.clearStorageSync).toHaveBeenCalled()
      expect(page.data.hasUserInfo).toBe(false)
      expect(page.data.phoneNumber).toBe('')
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'success' })
      )
    })

    it('取消清除缓存时不重置状态', () => {
      wx.showModal.mockImplementation(({ success }) => success({ confirm: false }))
      page.data.hasUserInfo = true

      page.clearCache.call(page)

      expect(wx.clearStorageSync).not.toHaveBeenCalled()
      expect(page.data.hasUserInfo).toBe(true)
    })
  })

  describe('navigateToMembership', () => {
    it('未登录时显示 Toast', () => {
      page.data.hasUserInfo = false

      page.navigateToMembership.call(page)

      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '请先登录' })
      )
      expect(wx.navigateTo).not.toHaveBeenCalled()
    })

    it('已登录时跳转会员中心', () => {
      page.data.hasUserInfo = true

      page.navigateToMembership.call(page)

      expect(wx.navigateTo).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining('membership') })
      )
    })
  })

  describe('getPhoneNumber', () => {
    it('用户拒绝时显示取消提示', () => {
      const e = { detail: { errMsg: 'getPhoneNumber:fail' } }

      page.getPhoneNumber.call(page, e)

      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringContaining('取消') })
      )
    })

    it('获取成功时调用云函数解析手机号', () => {
      wx.cloud.callFunction.mockImplementation(({ success }) => {
        success({ result: { success: true, phoneNumber: '13800138000' } })
      })
      const e = { detail: { errMsg: 'getPhoneNumber:ok', cloudID: 'mock-cloud-id' } }

      page.getPhoneNumber.call(page, e)

      expect(wx.showLoading).toHaveBeenCalled()
      expect(wx.cloud.callFunction).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'getPhoneNumber' })
      )
    })

    it('获取成功且有手机号时更新 phoneNumber', () => {
      wx.cloud.callFunction.mockImplementation(({ success }) => {
        success({ result: { success: true, phoneNumber: '13800138000' } })
      })
      const e = { detail: { errMsg: 'getPhoneNumber:ok', cloudID: 'mock-cloud-id' } }

      page.getPhoneNumber.call(page, e)

      expect(page.data.phoneNumber).toBe('13800138000')
    })
  })
})
