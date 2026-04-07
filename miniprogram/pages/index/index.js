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
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    isLoading: true,
    isEmergency: false,
    isAdmin: false,
    points: 18,
    streakDays: 6,
    dailyInsight: {
      title: '今日建议：\n先做低粉爆款研究',
      description: '先研究 3 个低粉爆款，再进入脚本生成。这样今天的选题判断会更稳。'
    },
    todayRanking: [
      { rank: '热点', title: '抖音热点榜', bot: 'content' },
      { rank: '低粉', title: '低粉爆款榜', bot: 'imagine' },
      { rank: '涨粉', title: '高涨粉榜', bot: 'expert' }
    ],
    creationCards: [
      { id: 'imagine', title: '智能选题', desc: '先定方向', icon: '◌' },
      { id: 'writer', title: '文案创作', desc: '生成文案', icon: '✎' },
      { id: 'expert', title: '爆款标题', desc: '强化点击', icon: '✦' },
      { id: 'content', title: '朋友圈文案', desc: '轻量输出', icon: '✉' }
    ],
    collectionTasks: [
      { id: 'c1', index: '01', title: '油管大神Dan Koe: 最快建立一人公司（详细指南）', desc: '', bot: 'expert' },
      { id: 'c2', index: '02', title: '拆解百万博主Dan Koe爆文创作系统', desc: '', bot: 'writer' },
      { id: 'c3', index: '03', title: '如何用AI做出百万价值的内容', desc: '', bot: 'content' }
    ],
    recentChats: [],
    statusBarHeight: 20,
    errorMsg: '页面加载出错，请重启小程序'
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({ canIUseGetUserProfile: true });
    }

    this.checkUserInfo();
    this.getSystemInfo();
    this.initializeDatabase();
    this.getRecentChats();
    this.checkAdminStatus();
  },

  onShow() {
    this.getRecentChats();
  },

  onPullDownRefresh() {
    this.checkUserInfo();
    this.getRecentChats();
    setTimeout(() => wx.stopPullDownRefresh(), 300);
  },

  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 20
      });
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
  },

  checkUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true,
        isLoading: false
      });
      return;
    }

    this.setData({ isLoading: false });
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({
          userInfo,
          hasUserInfo: true
        });
        this.saveUserToDatabase(userInfo);
      }
    });
  },

  saveUserToDatabase(userInfo) {
    wx.cloud.callFunction({
      name: 'userLogin',
      data: { userInfo },
      fail: (err) => console.error('保存用户信息失败:', err)
    });
  },

  initializeDatabase() {
    wx.cloud.callFunction({
      name: 'initDatabase',
      fail: (err) => console.error('数据库初始化失败', err)
    });
  },

  checkAdminStatus() {
    wx.cloud.callFunction({ name: 'checkAdmin' })
      .then((res) => {
        this.setData({
          isAdmin: !!(res.result && res.result.isAdmin)
        });
      })
      .catch(() => {
        this.setData({ isAdmin: false });
      });
  },

  openAIChat(e) {
    const { id } = e.currentTarget.dataset;
    const aiBot = AI_BOTS[id];

    if (!aiBot) {
      wx.showToast({ title: '该功能暂未开放', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/ai-chat/ai-chat?botId=${aiBot.botId}&title=${encodeURIComponent(aiBot.title)}&prompt=${encodeURIComponent(aiBot.prompt)}`
    });
  },

  openStudio() {
    wx.switchTab({
      url: '/pages/ai-features/index'
    });
  },

  continueChat(e) {
    const { id, botid, title } = e.currentTarget.dataset;
    if (!id || !botid) return;
    wx.navigateTo({
      url: `/pages/ai-chat/ai-chat?conversationId=${id}&botId=${botid}&title=${encodeURIComponent(title || '智能助手')}`
    });
  },

  getRecentChats() {
    const db = wx.cloud.database();
    db.collection('chats')
      .orderBy('updateTime', 'desc')
      .limit(3)
      .get()
      .then((res) => {
        this.setData({
          recentChats: (res.data || []).map((item) => ({
            ...item,
            title: item.title || '工作流记录',
            lastMessage: item.lastMessage || item.question || '继续完善这个任务'
          }))
        });
      })
      .catch((err) => {
        console.error('获取最近会话失败', err);
      });
  },

  claimDailyPoints() {
    wx.showToast({ title: '今日已打卡 +2', icon: 'none' });
  },

  openMembership() {
    wx.navigateTo({
      url: '/pages/membership/membership'
    });
  },

  reloadPage() {
    this.setData({ isEmergency: false });
    this.onLoad();
  }
});
