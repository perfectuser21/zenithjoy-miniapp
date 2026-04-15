describe('user page actions', () => {
  let page

  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    wx.showToast.mockClear()
    wx.showModal.mockClear()
    wx.clearStorageSync.mockClear()
    require('../../miniprogram/pages/user/user.js')

    const config = global.__getLastPage()
    page = {
      ...config,
      data: {
        ...config.data,
        hasUserInfo: true
      },
      setData(updates) {
        Object.assign(this.data, updates)
      }
    }
  })

  test('opens membership center when logged in', () => {
    page.openMembership()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/membership/membership'
    })
  })

  test('opens task center when logged in', () => {
    page.openTaskCenter()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/chatHistory/index'
    })
  })

  test('shows login toast before opening membership center', () => {
    page.data.hasUserInfo = false

    page.openMembership()

    expect(wx.showToast).toHaveBeenCalledWith({
      title: '请先登录',
      icon: 'none'
    })
    expect(wx.navigateTo).not.toHaveBeenCalled()
  })

  test('shows login toast before opening task center', () => {
    page.data.hasUserInfo = false

    page.openTaskCenter()

    expect(wx.showToast).toHaveBeenCalledWith({
      title: '请先登录',
      icon: 'none'
    })
    expect(wx.navigateTo).not.toHaveBeenCalled()
  })

  test('opens admin center', () => {
    page.openAdminCenter()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/admin/article/index'
    })
  })

  test('clears cache after confirmation', () => {
    page.clearCache()

    expect(wx.showModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '提示',
        content: '确定要清除缓存吗？这将清除本地保存的用户信息和聊天记录'
      })
    )
    expect(wx.clearStorageSync).toHaveBeenCalled()
    expect(page.data.hasUserInfo).toBe(false)
    expect(page.data.phoneNumber).toBe('')
    expect(page.data.membership).toEqual({
      level: 'free',
      name: '普通会员',
      expireDate: null
    })
    expect(wx.showToast).toHaveBeenCalledWith({
      title: '缓存已清除',
      icon: 'success'
    })
  })
})
