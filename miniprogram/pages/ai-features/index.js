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
    points: 128,
    creationSteps: [
      { no: '01', title: '收集关键词', desc: '先写下赛道、产品词和最近反复出现的问题。' },
      { no: '02', title: '补充灵感', desc: '把热点、案例和你想讲的切口整理进来。' },
      { no: '03', title: '明确人群', desc: '补齐目标读者、价值承诺和个人表达方式。' },
      { no: '04', title: '生成选题', desc: '系统会基于前面信息输出 5 个可执行方向。' },
      { no: '05', title: '扩写成稿', desc: '从选题进入正文，生成结构完整的文案初稿。' },
      { no: '06', title: '打磨发布', desc: '继续细修标题、语气和发布版本，直接进入输出。' }
    ],
    titleActions: [
      { label: '冲突型', bot: 'content' },
      { label: '数字型', bot: 'writer' },
      { label: '悬念型', bot: 'expert' },
      { label: '圈定人群', bot: 'content' },
      { label: '情绪型', bot: 'writer' },
      { label: '方法型', bot: 'expert' }
    ],
    momentActions: [
      { label: '想法', bot: 'content' },
      { label: '六大支柱', bot: 'writer' },
      { label: '内容类型', bot: 'expert' }
    ]
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

  openFeature(e) {
    const { id } = e.currentTarget.dataset;
    const aiBot = AI_BOTS[id];

    if (!aiBot) {
      wx.showToast({ title: '功能准备中', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/ai-chat/ai-chat?botId=${aiBot.botId}&title=${encodeURIComponent(aiBot.title)}&prompt=${encodeURIComponent(aiBot.prompt)}`
    });
  }
});
