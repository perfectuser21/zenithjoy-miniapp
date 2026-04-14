describe('user page actions', () => {
  let page

  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    wx.showToast.mockClear()
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
})
