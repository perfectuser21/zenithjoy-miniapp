describe('user page actions', () => {
  let page
  const fs = require('fs')
  const path = require('path')

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
      name: '成长会员',
      expireDate: null
    })
    expect(wx.showToast).toHaveBeenCalledWith({
      title: '缓存已清除',
      icon: 'success'
    })
  })

  test('user page matches current pencil profile structure', () => {
    expect(page.data.pageTitle).toBe('我的')
    expect(page.data.growthBenefits).toHaveLength(2)
    expect(page.data.assetMenus).toBeUndefined()
    expect(page.data.recentActivities).toHaveLength(3)
    expect(page.data.recentHighlights).toBeUndefined()
  })

  test('user page keeps global fixed custom tab bar visible', () => {
    const setData = jest.fn()
    const updateSelected = jest.fn()
    page.getTabBar = () => ({ setData, updateSelected })

    if (typeof page.onShow === 'function') {
      page.onShow()
    }
    expect(setData).toHaveBeenCalledWith({ hidden: false, selected: 3 })
    expect(updateSelected).toHaveBeenCalledWith('/pages/user/user')
  })

  test('user page uses tight top spacing like pencil', () => {
    const wxmlPath = path.resolve(__dirname, '../../miniprogram/pages/user/user.wxml')
    const wxml = fs.readFileSync(wxmlPath, 'utf8')

    expect(wxml).toContain('padding-top: {{statusBarHeight}}px;')
    expect(wxml).not.toContain('statusBarHeight + 16')
  })

  test('user page uses custom navigation to avoid extra native top blank', () => {
    const jsonPath = path.resolve(__dirname, '../../miniprogram/pages/user/user.json')
    const config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

    expect(config.navigationStyle).toBe('custom')
  })

  test('user page typography matches pencil headline scale', () => {
    const wxssPath = path.resolve(__dirname, '../../miniprogram/pages/user/user.wxss')
    const wxss = fs.readFileSync(wxssPath, 'utf8')

    expect(wxss).toContain('.user-title {\n  font-size: 58rpx;')
    expect(wxss).toContain('.user-section-title {\n  font-size: 35rpx;')
    expect(wxss).toContain('.user-profile-name {\n  font-size: 31rpx;')
    expect(wxss).toContain('.user-chip-title,\n.user-recent-title,\n.user-benefit-title,\n.user-points-label {\n  font-size: 27rpx;')
    expect(wxss).toContain('.user-profile-sub,\n.user-section-meta,\n.user-chip-desc,\n.user-points-growth,\n.user-points-spend,\n.user-section-accent,\n.user-benefit-status,\n.user-recent-value {\n  font-size: 23rpx;')
  })

  test('user points section keeps equal vertical spacing around current points area', () => {
    const wxssPath = path.resolve(__dirname, '../../miniprogram/pages/user/user.wxss')
    const wxss = fs.readFileSync(wxssPath, 'utf8')

    expect(wxss).toContain('.user-points-panel {\n  margin-top: 12rpx;')
    expect(wxss).toContain('.user-points-actions {\n  margin-top: 12rpx;')
    expect(wxss).toContain('.user-points-value {\n  margin-top: 0;')
  })

  test('user page removes recent highlight tags', () => {
    const wxmlPath = path.resolve(__dirname, '../../miniprogram/pages/user/user.wxml')
    const wxssPath = path.resolve(__dirname, '../../miniprogram/pages/user/user.wxss')
    const wxml = fs.readFileSync(wxmlPath, 'utf8')
    const wxss = fs.readFileSync(wxssPath, 'utf8')

    expect(wxml).not.toContain('user-recent-note')
    expect(wxml).not.toContain('user-edit-btn')
    expect(wxml).not.toContain('wx:for="{{recentHighlights}}"')
    expect(wxml).not.toContain('积分明细')
    expect(wxml).not.toContain('任务中心')
    expect(wxml).not.toContain('会员管理')
    expect(wxss).not.toContain('.user-recent-tags {')
    expect(wxss).not.toContain('.user-recent-tag {')
    expect(wxss).not.toContain('.user-menu-row')
  })
})
