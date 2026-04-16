describe('moments pages pencil defaults', () => {
  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    wx.navigateBack.mockClear()
    wx.switchTab.mockClear()
    wx.redirectTo.mockClear()
  })

  test('moments generate falls back to pencil-aligned source copy', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => []),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-generate/moments-generate.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }
    page.onShow()

    expect(page.data.sourceContext.articleContent).toContain('很多人以为')
    expect(page.data.heroCard.title).toBe('基于现有内容，快速生成更适合朋友圈发布的表达版本')
    expect(page.data.variantRows[0][0].text).toBe('认知教育类')
  })

  test('moments editor falls back to pencil-aligned preview content', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => []),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-editor/moments-editor.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }
    page.onShow()

    expect(page.data.heroCard.title).toBe('把语气、节奏和结尾动作再修到更自然')
    expect(page.data.activeContent).toContain('很多人不是不够努力')
    expect(page.data.editActions[0]).toBe('去 AI 味')
  })
})
