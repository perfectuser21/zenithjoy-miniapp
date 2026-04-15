describe('workflow page routing', () => {
  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    require('../../miniprogram/pages/ai-features/index.js')
  })

  test('opens copywriter start', () => {
    const page = global.__getLastPage()
    page.openCopywriterStart()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/copywriter/start/start'
    })
  })

  test('opens title studio', () => {
    const page = global.__getLastPage()
    page.openTitleStudio()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/copywriter/title-generate/title-generate'
    })
  })

  test('opens moments studio', () => {
    const page = global.__getLastPage()
    page.openMomentsStudio()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/copywriter/moments-generate/moments-generate'
    })
  })
})
