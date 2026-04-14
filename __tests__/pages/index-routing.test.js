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
})
