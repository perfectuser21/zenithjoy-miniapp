describe('index page routing', () => {
  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    require('../../miniprogram/pages/index/index.js')
  })

  test('opens copywriter start', () => {
    const page = global.__getLastPage()
    page.openCopywriterStart()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/copywriter/start/start'
    })
  })

  test('opens ranking detail', () => {
    const page = global.__getLastPage()
    page.openRankingDetail()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/ranking/detail/detail'
    })
  })

  test('opens reading detail', () => {
    const page = global.__getLastPage()
    page.openReadingDetail()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/reading-list/detail/detail'
    })
  })

  test('does not fall through to retired public routes for unknown actions', () => {
    const page = global.__getLastPage()
    wx.showToast.mockClear()

    page.handleAction({
      currentTarget: {
        dataset: {
          type: 'page',
          target: 'unknown'
        }
      }
    })

    expect(wx.navigateTo).not.toHaveBeenCalled()
    expect(wx.showToast).toHaveBeenCalledWith({
      title: '该功能暂未开放',
      icon: 'none'
    })
  })
})
