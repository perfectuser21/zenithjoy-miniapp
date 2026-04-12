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
    isAdmin: false,
    showPrivacy: false,        // 控制隐私协议弹窗显示
    statusBarHeight: 20,
    memberInitial: "X",
    memberTier: "成长会员",
    streakDays: 6,
    heroCard: {
      tag: "今日创作提示",
      titleTop: "今日建议：",
      titleBottom: "先做低粉爆款研究",
      description: "先研究 3 个低粉爆款，再进入脚本生成。这样今天的选题判断会更稳。",
      image: "/images/home-banner.png"
    },
    rankingItems: [
      { tag: "热点", title: "抖音热点榜", actionType: "page", actionTarget: "articles" },
      { tag: "低粉", title: "低粉爆款榜", actionType: "chat", actionTarget: "imagine" },
      { tag: "涨粉", title: "高涨粉榜", actionType: "chat", actionTarget: "content" }
    ],
    creationTools: [
      { title: "智能选题", meta: "先定方向", iconType: "target", cardClass: "tool-card-gradient", iconBoxClass: "tool-icon-box-gradient", actionType: "chat", actionTarget: "content" },
      { title: "文案创作", meta: "6 步工作流", iconType: "pen", cardClass: "tool-card-blue", iconBoxClass: "tool-icon-box-blue", actionType: "page", actionTarget: "copywriter" },
      { title: "爆款标题", meta: "强化点击", iconType: "sparkles", cardClass: "tool-card-purple", iconBoxClass: "tool-icon-box-purple", actionType: "chat", actionTarget: "content" },
      { title: "朋友圈文案", meta: "轻量输出", iconType: "send", cardClass: "tool-card-indigo", iconBoxClass: "tool-icon-box-indigo", actionType: "chat", actionTarget: "expert" },
      { title: "代码预览台", meta: "左改右看", iconType: "sparkles", cardClass: "tool-card-purple", iconBoxClass: "tool-icon-box-purple", actionType: "page", actionTarget: "playground" }
    ],
    collectionItems: [
      { index: "01", title: "油管大神Dan Koe: 最快建立一人公司", actionType: "page", actionTarget: "articles" },
      { index: "02", title: "拆解百万博主Dan Koe爆文创作系统", actionType: "page", actionTarget: "articles" },
      { index: "03", title: "如何用AI做出百万价值的内容", actionType: "page", actionTarget: "articles" }
    ]
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({ canIUseGetUserProfile: true });
    }

    this.checkUserInfo();
    this.getSystemInfo();
    this.initializeDatabase();
    this.checkAdminStatus();
    this.loadHeroCard();
    this.checkPrivacySetting();
  },

  // 检查隐私授权状态（首次启动时主动弹出）
  checkPrivacySetting() {
    if (!wx.getPrivacySetting) return;
    wx.getPrivacySetting({
      success: (res) => {
        if (res.needAuthorization) {
          this.setData({ showPrivacy: true });
        }
      }
    });
  },

  // 供 App onNeedPrivacyAuthorization 回调调用
  showPrivacyModal() {
    this.setData({ showPrivacy: true });
  },

  // 用户同意隐私协议
  agreePrivacy() {
    if (wx.agreePrivacyAuthorization) {
      wx.agreePrivacyAuthorization({
        success: () => {
          this.setData({ showPrivacy: false });
          const app = getApp();
          if (app.globalData.privacyResolve) {
            app.globalData.privacyResolve({ event: 'agree', buttonId: 'agree-btn' });
            app.globalData.privacyResolve = null;
            app.globalData.needPrivacyModal = false;
          }
        }
      });
    } else {
      this.setData({ showPrivacy: false });
    }
  },

  // 用户拒绝隐私协议（不允许继续使用）
  disagreePrivacy() {
    wx.showModal({
      title: '提示',
      content: '您需要同意隐私协议才能正常使用本小程序',
      showCancel: false,
      confirmText: '重新阅读',
      success: () => {
        this.setData({ showPrivacy: true });
      }
    });
  },

  // 跳转到隐私协议页面
  openPrivacyPage() {
    wx.navigateTo({
      url: '/pages/web-view/web-view?url=https%3A%2F%2Fzenithjoy.cc%2Fprivacy'
    });
  },

  onPullDownRefresh() {
    this.checkUserInfo();
    setTimeout(() => wx.stopPullDownRefresh(), 300);
  },

  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 20
      });
    } catch (e) {
      console.error("获取系统信息失败:", e);
    }
  },

  checkUserInfo() {
    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      const nickname = userInfo.nickName || "";
      this.setData({
        userInfo,
        hasUserInfo: true,
        isLoading: false,
        memberInitial: nickname ? nickname.slice(0, 1).toUpperCase() : "X"
      });
      return;
    }

    this.setData({
      isLoading: false,
      memberInitial: "X"
    });
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: "用于完善会员资料",
      success: (res) => {
        const userInfo = res.userInfo;
        const nickname = userInfo.nickName || "";
        wx.setStorageSync("userInfo", userInfo);
        this.setData({
          userInfo,
          hasUserInfo: true,
          memberInitial: nickname ? nickname.slice(0, 1).toUpperCase() : "X"
        });
        this.saveUserToDatabase(userInfo);
      }
    });
  },

  saveUserToDatabase(userInfo) {
    wx.cloud.callFunction({
      name: "userLogin",
      data: { userInfo },
      fail: (err) => console.error("保存用户信息失败:", err)
    });
  },

  initializeDatabase() {
    wx.cloud.callFunction({
      name: "initDatabase",
      fail: (err) => console.error("数据库初始化失败", err)
    });
  },

  checkAdminStatus() {
    wx.cloud.callFunction({ name: "checkAdmin" })
      .then((res) => {
        this.setData({
          isAdmin: !!(res.result && res.result.isAdmin)
        });
      })
      .catch(() => {
        this.setData({ isAdmin: false });
      });
  },

  loadHeroCard() {
    wx.cloud.database().collection('dynamic_content')
      .where({ type: 'hero_card', active: true })
      .orderBy('updated_at', 'desc')
      .limit(1)
      .get()
      .then(res => {
        if (res.data && res.data.length > 0) {
          const card = res.data[0];
          this.setData({
            heroCard: {
              tag: card.tag || '今日创作提示',
              titleTop: card.title_top || '',
              titleBottom: card.title_bottom || '',
              description: card.description || '',
              image: card.image || '/images/home-banner.png'
            }
          });
        }
      })
      .catch(err => {
        console.warn('[index] heroCard 云数据库加载失败，使用默认值', err);
      });
  },

  handleAction(e) {
    const { type, target } = e.currentTarget.dataset;

    if (type === "chat") {
      this.openAIChat({ currentTarget: { dataset: { id: target } } });
      return;
    }

    if (target === "studio") {
      this.openStudio();
      return;
    }

    if (target === "membership") {
      this.openMembership();
      return;
    }

    if (target === "copywriter") {
      this.openCopywriter();
      return;
    }

    if (target === "playground") {
      this.openPlayground();
      return;
    }

    this.openArticleLibrary();
  },

  openAIChat(e) {
    const { id } = e.currentTarget.dataset;
    const aiBot = AI_BOTS[id];

    if (!aiBot) {
      wx.showToast({ title: "该功能暂未开放", icon: "none" });
      return;
    }

    wx.navigateTo({
      url: `/pages/ai-chat/ai-chat?botId=${aiBot.botId}&title=${encodeURIComponent(aiBot.title)}&prompt=${encodeURIComponent(aiBot.prompt)}`
    });
  },

  openStudio() {
    wx.switchTab({
      url: "/pages/ai-features/index"
    });
  },

  openAssistantTab() {
    wx.switchTab({
      url: "/pages/assistant/index"
    });
  },

  openUserTab() {
    wx.switchTab({
      url: "/pages/user/user"
    });
  },

  openMembership() {
    wx.navigateTo({
      url: "/pages/membership/membership"
    });
  },

  openCopywriter() {
    wx.navigateTo({
      url: "/pages/copywriter/start/start"
    });
  },

  openArticleLibrary() {
    wx.navigateTo({
      url: "/pages/article-list/article-list"
    });
  },

  openPlayground() {
    wx.navigateTo({
      url: "/pages/playground/index"
    });
  }
});
