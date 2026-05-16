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
})
