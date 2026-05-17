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
    homeTitle: "今天先做什么",
    heroCard: {
      tag: "今日创作提示",
      titleTop: "今日建议：先做低粉爆款研究",
      titleBottom: "",
      description: "先研究 3 个低粉爆款，再进入脚本生成。这样今天的选题判断会更稳。",
      image: "/images/home-banner.png"
    },
    rankingItems: [
      { tag: "热点", title: "抖音热点榜", emphasis: "equal" },
      { tag: "低粉", title: "低粉爆款榜", emphasis: "equal" },
      { tag: "涨粉", title: "高涨粉榜", emphasis: "equal" }
    ],
    creationCards: [
      { icon: "✍", title: "文案创作", description: "生成文案", tone: "blue", layout: "full" },
      { icon: "★", title: "爆款标题", description: "强化点击", tone: "violet", layout: "full" },
      { icon: "✉", title: "朋友圈文案", description: "轻量输出", tone: "indigo", layout: "full" }
    ],
    creationEntry: {
      title: "自媒体创作区域",
      description: "常用工具",
      primaryAction: "进入工作流"
    },
    collectionItems: [
      { index: "01", title: "油管大神Dan Koe: 最快建立一人公司", emphasis: "equal" },
      { index: "02", title: "拆解百万博主Dan Koe爆文创作系统", emphasis: "equal" }
    ]
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar && tabBar.setData) {
      tabBar.setData({ hidden: false, selected: 0 })
      if (typeof tabBar.updateSelected === 'function') {
        tabBar.updateSelected('/pages/index/index')
      }
    }
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
              tag: card.tag || 'HOME',
              titleTop: `${card.title_top || '今日建议：'}${card.title_bottom || '先做低粉爆款研究'}`,
              titleBottom: '',
              description: card.description || '先研究 3 个低粉爆款，再进入脚本生成。这样今天的选题判断会更稳。',
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
    const { target } = e.currentTarget.dataset;

    if (target === "studio") {
      this.openWorkflowHub();
      return;
    }

    if (target === "membership") {
      this.openMembership();
      return;
    }

    if (target === "copywriter") {
      this.openWorkflowHub();
      return;
    }

    if (target === "rankingDetail") {
      this.openRankingDetail();
      return;
    }

    if (target === "readingDetail") {
      this.openReadingDetail();
      return;
    }

    wx.showToast({ title: "该功能暂未开放", icon: "none" });
  },

  openWorkflowHub() {
    wx.switchTab({
      url: "/pages/ai-features/index"
    });
  },

  openCreationHub() {
    this.openWorkflowHub();
  },

  openMembership() {
    wx.navigateTo({
      url: "/pages/membership/membership"
    });
  },

  openCopywriterStart() {
    this.openWorkflowHub();
  },

  openCopywriter() {
    this.openWorkflowHub();
  },

  openRankingDetail() {
    const targetUrl = "/pages/ranking/detail/detail";
    wx.navigateTo({
      url: targetUrl,
      fail: () => {
        wx.redirectTo({
          url: targetUrl,
          fail: () => {
            wx.reLaunch({ url: targetUrl });
          }
        });
      }
    });
  },

  openReadingDetail() {
    wx.navigateTo({
      url: "/pages/reading-list/detail/detail"
    });
  }
});
