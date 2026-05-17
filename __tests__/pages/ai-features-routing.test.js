const fs = require('fs')
const path = require('path')

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

  test('workflow matches current pencil sections and chip labels', () => {
    const page = global.__getLastPage()

    expect(page.data.eyebrow).toBe('CREATE STUDIO')
    expect(page.data.pageTitle).toBe('今天创作什么')
    expect(page.data.heroCard).toEqual({
      kicker: 'WORKFLOW OVERVIEW',
      title: '三条正式创作流程',
      description: '从创作、标题到朋友圈文案，按流程推进并直接进入执行。',
      image: '/images/studio-banner.png'
    })
    expect(page.data.sections).toEqual([
      {
        title: '自媒体创作区域',
        meta: '按流程执行',
        tone: 'create',
        steps: ['关键词', '灵感', '知识库', '选题'],
        outcome: '梳理创作方向，得到可执行选题与内容框架',
        cta: '进入创作流程',
        action: 'copywriter'
      },
      {
        title: '标题创作区域',
        meta: '根据当前选题',
        tone: 'title',
        steps: ['确定选题', '生成标题', '筛选优化'],
        outcome: '快速得到一组可直接测试的标题方向',
        cta: '进入标题创作',
        action: 'title'
      },
      {
        title: '朋友圈文案区域',
        meta: '根据需求生成',
        tone: 'moments',
        steps: ['明确需求', '生成文案', '继续精修'],
        outcome: '输出可发布的朋友圈文案，并保留后续优化空间',
        cta: '进入朋友圈文案',
        action: 'moments'
      }
    ])
  })

  test('workflow keeps global fixed custom tab bar visible and selected on create', () => {
    const page = global.__getLastPage()
    const setData = jest.fn()
    const updateSelected = jest.fn()
    page.getTabBar = () => ({ setData, updateSelected })

    if (typeof page.onShow === 'function') {
      page.onShow()
    }
    expect(setData).toHaveBeenCalledWith({ hidden: false, selected: 1 })
    expect(updateSelected).toHaveBeenCalledWith('/pages/ai-features/index')
  })

  test('workflow wxml matches current pencil sections', () => {
    const wxmlPath = path.resolve(__dirname, '../../miniprogram/pages/ai-features/index.wxml')
    const wxml = fs.readFileSync(wxmlPath, 'utf8')

    expect(wxml).toContain('padding-top: {{statusBarHeight + 8}}px;')
    expect(wxml).toContain('class="p-banner-card"')
    expect(wxml).not.toContain('class="p-stat-pill"')
    expect(wxml).toContain('wx:for="{{sections}}"')
    expect(wxml).toContain('class="p-card p-process-card p-process-card-{{item.tone}}"')
    expect(wxml).toContain('class="p-process-track p-process-track-{{item.tone}}"')
    expect(wxml).toContain('class="p-process-step"')
    expect(wxml).toContain('{{item.cta}}')
    expect(wxml).not.toContain('首页')
    expect(wxml).not.toContain('AI助理')
  })

  test('workflow typography and button spacing match current pencil design', () => {
    const wxssPath = path.resolve(__dirname, '../../miniprogram/pages/ai-features/index.wxss')
    const wxss = fs.readFileSync(wxssPath, 'utf8')

    expect(wxss).toContain('.p-page-title {\n  font-size: 62rpx;')
    expect(wxss).toContain('.p-section-title {\n  font-size: 35rpx;')
    expect(wxss).toContain('.p-shell {\n  padding: 0 38rpx calc(124rpx + env(safe-area-inset-bottom));')
    expect(wxss).toContain('.p-banner-card {\n  position: relative;\n  height: 215rpx;')
    expect(wxss).toContain('.p-banner-image {\n  width: 100%;\n  height: 215rpx;')
    expect(wxss).toContain('.p-card {\n  padding: 19rpx;')
    expect(wxss).toContain('.p-process-track {\n  padding: 12rpx 19rpx;')
    expect(wxss).toContain('justify-content: space-between;')
    expect(wxss).toContain('.p-process-step {\n  min-height: 54rpx;')
    expect(wxss).toContain('padding: 0 19rpx;')
    expect(wxss).toContain('font-size: 23rpx;')
    expect(wxss).toContain('.p-process-outcome {\n  font-size: 23rpx;')
    expect(wxss).toContain('.p-process-cta {\n  margin-top: 0;\n  height: 77rpx;')
    expect(wxss).toContain('.p-process-track-create {')
    expect(wxss).toContain('#e6ebff')
    expect(wxss).toContain('.p-process-track-title {')
    expect(wxss).toContain('#f2e8ff')
    expect(wxss).toContain('.p-process-track-moments {')
    expect(wxss).toContain('#e2ecff')
  })

  test('workflow page uses custom navigation to avoid duplicate top spacing', () => {
    const jsonPath = path.resolve(__dirname, '../../miniprogram/pages/ai-features/index.json')
    const config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

    expect(config.navigationStyle).toBe('custom')
  })
})
