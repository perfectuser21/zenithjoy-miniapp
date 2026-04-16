const fs = require('fs')
const path = require('path')

describe('assistant page actions', () => {
  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    require('../../miniprogram/pages/assistant/index.js')
  })

  test('opens business advisor chat', () => {
    const page = global.__getLastPage()
    page.openBusinessAdvisor()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: `/pages/ai-chat/ai-chat?botId=7481213361658036235&title=${encodeURIComponent('经营顾问')}&prompt=${encodeURIComponent('我是你的经营顾问，可以帮你规划一人公司的内容、增长、商业化和每日行动优先级。')}`
    })
  })

  test('opens topic planner chat', () => {
    const page = global.__getLastPage()
    page.openTopicPlanner()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: `/pages/ai-chat/ai-chat?botId=7481213430658433034&title=${encodeURIComponent('选题策划师')}&prompt=${encodeURIComponent('我是选题策划师，可以围绕你的账号定位、近期趋势和目标用户，生成一组可执行的内容选题。')}`
    })
  })

  test('opens benchmark analysis chat', () => {
    const page = global.__getLastPage()
    page.openBenchmarkAnalysis()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: `/pages/ai-chat/ai-chat?botId=7481213488808099874&title=${encodeURIComponent('对标账号分析')}&prompt=${encodeURIComponent('我是对标账号分析助手，可以帮你拆解参考账号的定位、内容结构、更新策略和商业动作。')}`
    })
  })

  test('opens script generator chat', () => {
    const page = global.__getLastPage()
    page.openScriptGenerator()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: `/pages/ai-chat/ai-chat?botId=7481212266399449139&title=${encodeURIComponent('脚本生成器')}&prompt=${encodeURIComponent('我是脚本生成器，可以帮你把一个模糊想法整理成可直接拍摄或发布的内容脚本。告诉我主题、受众和风格要求。')}`
    })
  })

  test('assistant page matches current pencil preview structure', () => {
    const page = global.__getLastPage()

    expect(page.data.pageTitle).toBe('AI 助理')
    expect(page.data.onlineState).toBe('在线服务中')
    expect(page.data.serviceChips).toHaveLength(0)
    expect(page.data.inputPlaceholder).toBe('输入你的问题...')
  })

  test('assistant page keeps global fixed custom tab bar visible', () => {
    const page = global.__getLastPage()
    const setData = jest.fn()
    const updateSelected = jest.fn()
    page.getTabBar = () => ({ setData, updateSelected })

    if (typeof page.onShow === 'function') {
      page.onShow()
    }
    expect(setData).toHaveBeenCalledWith({ hidden: false, selected: 2 })
    expect(updateSelected).toHaveBeenCalledWith('/pages/assistant/index')
  })

  test('assistant wxml does not render a page-local tab pill', () => {
    const wxmlPath = path.resolve(__dirname, '../../miniprogram/pages/assistant/index.wxml')
    const wxml = fs.readFileSync(wxmlPath, 'utf8')

    expect(wxml).not.toContain('assistant-pill-nav')
    expect(wxml).not.toContain('首页')
    expect(wxml).not.toContain('创作')
  })

  test('assistant page removes legacy service chips', () => {
    const wxmlPath = path.resolve(__dirname, '../../miniprogram/pages/assistant/index.wxml')
    const wxml = fs.readFileSync(wxmlPath, 'utf8')

    expect(wxml).not.toContain('assistant-service-row')
    expect(wxml).not.toContain('常见问题库')
    expect(wxml).not.toContain('徐先生课程')
    expect(wxml).not.toContain('联系我们')
  })

  test('assistant page typography matches pencil font sizes', () => {
    const wxssPath = path.resolve(__dirname, '../../miniprogram/pages/assistant/index.wxss')
    const wxss = fs.readFileSync(wxssPath, 'utf8')

    expect(wxss).toContain('.assistant-title {\n  font-size: 58rpx;')
    expect(wxss).toContain('.assistant-state-label {\n  font-size: 23rpx;')
    expect(wxss).toContain('.assistant-state-meta {\n  font-size: 21rpx;')
    expect(wxss).toContain('.assistant-panel-title {\n  font-size: 31rpx;')
    expect(wxss).toContain('.assistant-bubble {\n  flex: 1;')
    expect(wxss).toContain('font-size: 27rpx;')
    expect(wxss).toContain('.assistant-cta {\n  min-width: 292rpx;')
    expect(wxss).toContain('.assistant-send {\n  width: 124rpx;')
    expect(wxss).toContain('font-size: 27rpx;')
  })
})
