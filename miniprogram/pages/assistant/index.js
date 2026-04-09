const AI_BOTS = {
  writer: {
    botId: "7481212266399449139",
    title: "脚本生成器",
    prompt: "我是脚本生成器，可以帮你把一个模糊想法整理成可直接拍摄或发布的内容脚本。告诉我主题、受众和风格要求。"
  },
  content: {
    botId: "7481213430658433034",
    title: "选题策划师",
    prompt: "我是选题策划师，可以围绕你的账号定位、近期趋势和目标用户，生成一组可执行的内容选题。"
  },
  imagine: {
    botId: "7481213488808099874",
    title: "对标账号分析",
    prompt: "我是对标账号分析助手，可以帮你拆解参考账号的定位、内容结构、更新策略和商业动作。"
  },
  expert: {
    botId: "7481213361658036235",
    title: "经营顾问",
    prompt: "我是你的经营顾问，可以帮你规划一人公司的内容、增长、商业化和每日行动优先级。"
  }
};

Page({
  data: {
    statusBarHeight: 20,
    quickActions: [
      '常见问题',
      '徐先生课程',
      '联系我们'
    ],
    previewMessage: '我可以先帮你拆 3 条低粉爆款，再给你可用标题。'
  },

  onLoad() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 20
      });
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
  },

  openAssistant(e) {
    const { prompt, bot } = e.currentTarget.dataset;
    const aiBot = AI_BOTS[bot || 'expert'];
    wx.navigateTo({
      url: `/pages/ai-chat/ai-chat?botId=${aiBot.botId}&title=${encodeURIComponent(aiBot.title)}&prompt=${encodeURIComponent(prompt || aiBot.prompt)}`
    });
  }
});
