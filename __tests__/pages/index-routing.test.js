describe('index page routing', () => {
  const fs = require('fs')
  const path = require('path')

  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    wx.switchTab.mockClear()
    require('../../miniprogram/pages/index/index.js')
  })

  test('hero action opens workflow tab', () => {
    const page = global.__getLastPage()
    page.openWorkflowHub()

    expect(wx.switchTab).toHaveBeenCalledWith({
      url: '/pages/ai-features/index'
    })
  })

  test('creation section opens workflow tab', () => {
    const page = global.__getLastPage()
    page.openCreationHub()

    expect(wx.switchTab).toHaveBeenCalledWith({
      url: '/pages/ai-features/index'
    })
  })

  test('home matches current pencil title and section counts', () => {
    const page = global.__getLastPage()

    expect(page.data.homeTitle).toBe('今天先做什么')
    expect(page.data.heroCard.titleTop).toBe('今日建议：先做低粉爆款研究')
    expect(page.data.heroCard.titleBottom).toBe('')
    expect(page.data.rankingItems).toHaveLength(3)
    expect(page.data.creationCards).toHaveLength(3)
    expect(page.data.creationCards[0].layout).toBe('full')
    expect(page.data.creationCards[1].layout).toBe('full')
    expect(page.data.creationCards[2].layout).toBe('full')
    expect(page.data.creationCards[0].description).toBe('生成文案')
    expect(page.data.collectionItems).toHaveLength(2)
    expect(page.data.collectionItems[0].title).toBe('油管大神Dan Koe: 最快建立一人公司')
    expect(page.data.collectionItems[1].title).toBe('拆解百万博主Dan Koe爆文创作系统')
  })

  test('home syncs latest pencil spacing and typography', () => {
    const wxmlPath = path.resolve(__dirname, '../../miniprogram/pages/index/index.wxml')
    const wxssPath = path.resolve(__dirname, '../../miniprogram/pages/index/index.wxss')
    const wxml = fs.readFileSync(wxmlPath, 'utf8')
    const wxss = fs.readFileSync(wxssPath, 'utf8')

    expect(wxml).toContain('padding-top: {{statusBarHeight + 8}}px;')
    expect(wxss).toContain('.home-shell {\n  padding: 0 20rpx calc(124rpx + env(safe-area-inset-bottom));')
    expect(wxml).not.toContain('home-user-entry')
    expect(wxss).toContain('.home-hero-card {\n  position: relative;\n  min-height: 265rpx;')
    expect(wxss).toContain('border-radius: 35rpx;')
    expect(wxss).toContain('.home-hero-image {\n  width: 100%;\n  height: 265rpx;')
    expect(wxss).toContain('.home-hero-kicker {\n  display: inline-flex;\n  align-self: flex-start;\n  padding: 12rpx 23rpx;')
    expect(wxss).toContain('.home-hero-content {\n  position: absolute;')
    expect(wxss).toContain('display: flex;')
    expect(wxss).toContain('flex-direction: column;')
    expect(wxss).toContain('gap: 15rpx;')
    expect(wxml).not.toContain('home-hero-copy-secondary')
    expect(wxss).toContain('.home-section-card {\n  padding: 19rpx;')
    expect(wxss).toContain('.home-section-title {\n  font-size: 35rpx;')
    expect(wxml).toContain('精选文章')
    expect(wxml).not.toContain('精选 文章')
    expect(wxss).toContain('.home-creation-item {\n  min-height: 115rpx;')
    expect(wxss).toContain('.home-creation-item-title {\n  font-size: 27rpx;')
    expect(wxss).toContain('line-height: 1.3;')
    expect(wxss).toContain('.home-creation-item-desc {\n  margin-top: 6rpx;')
    expect(wxss).toContain('.home-creation-icon {\n  width: 42rpx;\n  height: 42rpx;')
    expect(wxss).toContain('top: 12rpx;')
    expect(wxss).toContain('right: 12rpx;')
    expect(wxss).toContain('.home-collection-index {\n  width: 69rpx;\n  height: 38rpx;')
    expect(wxss).toContain('font-size: 23rpx;')
  })

  test('opens ranking detail', () => {
    const page = global.__getLastPage()
    page.openRankingDetail()

    expect(wx.navigateTo).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/pages/ranking/detail/detail'
      })
    )
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
