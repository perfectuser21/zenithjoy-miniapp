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
})
