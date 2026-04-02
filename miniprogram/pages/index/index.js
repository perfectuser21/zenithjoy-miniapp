// 首页

// AI助手类型配置
const AI_BOTS = {
  writer: {
    botId: "7481212266399449139", // agent1
    title: "脚本生成器",
    prompt: "我是脚本生成器，可以帮你把一个模糊想法整理成可直接拍摄或发布的内容脚本。告诉我主题、受众和风格要求。"
  },
  content: {
    botId: "7481213430658433034", // agent2
    title: "选题策划师",
    prompt: "我是选题策划师，可以围绕你的账号定位、近期趋势和目标用户，生成一组可执行的内容选题。"
  },
  imagine: {
    botId: "7481213488808099874", // agent3
    title: "对标账号分析",
    prompt: "我是对标账号分析助手，可以帮你拆解参考账号的定位、内容结构、更新策略和商业动作。"
  },
  expert: {
    botId: "7481213361658036235", // agent4
    title: "经营顾问",
    prompt: "我是你的经营顾问，可以帮你规划一人公司的内容、增长、商业化和每日行动优先级。"
  }
};

// 定义首页
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    isLoading: true,
    isEmergency: false,        // 默认不显示应急页面
    isAdmin: false,            // 添加管理员状态标记
    points: 18,
    streakDays: 6,
    growthLevel: '个人厂牌启动中',
    dailyInsight: {
      title: '今天优先做一条高信号内容',
      description: '先做调研，再产出一条脚本，把灵感消耗在最可能增长的选题上。'
    },
    workflowGroups: [
      {
        title: '今日高价值工作流',
        workflows: [
          { id: 'imagine', name: '对标账号分析', cost: 6, duration: '3 min', summary: '快速拆出参考账号的定位、形式和增长动作', badge: '增长' },
          { id: 'content', name: '爆款选题生成', cost: 4, duration: '2 min', summary: '基于你的赛道生成今天值得做的内容方向', badge: '内容' }
        ]
      },
      {
        title: '创作与经营',
        workflows: [
          { id: 'writer', name: '脚本生成器', cost: 5, duration: '4 min', summary: '把一个想法展开成可拍摄、可发布的脚本结构', badge: '产出' },
          { id: 'expert', name: '一人公司顾问', cost: 3, duration: '不限', summary: '用于每日规划、商业动作和账号经营判断', badge: '决策' }
        ]
      }
    ],
    dailyTasks: [
      { title: '登录打卡', reward: '+2 积分', status: 'done' },
      { title: '完成一次对标分析', reward: '+3 积分', status: 'pending' },
      { title: '生成一条内容脚本', reward: '+5 积分', status: 'pending' }
    ],
    personaTags: [
      '个人品牌',
      '内容创业',
      'AI工作流'
    ],
    recentChats: [],           // 最近会话列表
    systemInfo: {},            // 系统信息
    statusBarHeight: 20,       // 状态栏高度，默认20px
    navBarHeight: 44,          // 导航栏高度，默认44px
    capsuleButtonInfo: {},     // 胶囊按钮信息
  },

  onLoad: function () {
    console.log('首页 onLoad 开始执行');
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
    
    // 检查是否有用户信息
    this.checkUserInfo();
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 数据库初始化
    this.initializeDatabase();
    
    // 获取最近会话
    this.getRecentChats();
    
    // 检查管理员状态
    this.checkAdminStatus();
    
    console.log('首页 onLoad 完成');
  },
  
  onReady: function() {
    console.log('首页 onReady 被调用');
  },
  
  onShow: function() {
    console.log('首页 onShow 被调用');
    
    // 每次显示页面都重新获取最近会话
    this.getRecentChats();
  },
  
  onHide: function() {
    console.log('首页 onHide 被调用');
  },
  
  onUnload: function() {
    console.log('首页 onUnload 被调用');
  },
  
  onShareAppMessage: function() {
    return {
      title: 'AI一人公司工作台',
      path: '/pages/index/index'
    };
  },
  
  onShareTimeline: function() {
    return {
      title: '用 AI 把个人品牌经营成一人公司',
      query: ''
    };
  },
  
  onTabItemTap: function(item) {
    console.log('首页 onTabItemTap 被调用', item);
  },
  
  // 获取系统信息
  getSystemInfo: function() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || 20;
      const navBarHeight = 44;
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      
      this.setData({
        systemInfo,
        statusBarHeight,
        navBarHeight,
        capsuleButtonInfo: menuButtonInfo
      });
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
  },
  
  // 检查用户信息
  checkUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true,
        isLoading: false
      });
    } else {
      this.setData({
        isLoading: false
      });
    }
  },
  
  // 获取用户信息
  getUserProfile: function(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        console.log('获取用户信息成功:', res);
        const userInfo = res.userInfo;
        
        wx.setStorageSync('userInfo', userInfo);
        
        this.setData({
          userInfo,
          hasUserInfo: true
        });
        
        this.saveUserToDatabase(userInfo);
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
      }
    });
  },
  
  // 保存用户信息到数据库
  saveUserToDatabase: function(userInfo) {
    wx.cloud.callFunction({
      name: 'userLogin',
      data: {
        userInfo: userInfo
      },
      success: (res) => {
        console.log('保存用户信息成功:', res);
      },
      fail: (err) => {
        console.error('保存用户信息失败:', err);
      }
    });
  },
  
  // 数据库初始化
  initializeDatabase: function() {
    wx.cloud.callFunction({
      name: 'initDatabase',
      success: res => {
        console.log('数据库初始化成功', res);
      },
      fail: err => {
        console.error('数据库初始化失败', err);
      }
    });
  },
  
  // 检查管理员状态
  checkAdminStatus: function() {
    wx.cloud.callFunction({
      name: 'checkAdmin'
    }).then(res => {
      console.log('检查管理员状态:', res);
      if (res.result && res.result.isAdmin) {
        this.setData({
          isAdmin: true
        });
      }
    }).catch(err => {
      console.error('检查管理员状态失败:', err);
      // 即使检查失败，也默认设置为非管理员
      this.setData({
        isAdmin: false
      });
    });
  },
  
  // 打开AI助手会话
  openAIChat: function(e) {
    const { id } = e.currentTarget.dataset;
    const aiBot = AI_BOTS[id];
    
    if (aiBot) {
      // 跳转到聊天页面
      wx.navigateTo({
        url: `/pages/ai-chat/ai-chat?botId=${aiBot.botId}&title=${encodeURIComponent(aiBot.title)}&prompt=${encodeURIComponent(aiBot.prompt)}`
      });
    } else {
      wx.showToast({
        title: '该功能暂未开放',
        icon: 'none'
      });
    }
  },
  
  // 继续最近的会话
  continueChat: function(e) {
    const { id, botid, title } = e.currentTarget.dataset;
    
    if (id && botid) {
      wx.navigateTo({
        url: `/pages/ai-chat/ai-chat?conversationId=${id}&botId=${botid}&title=${encodeURIComponent(title || '智能助手')}`
      });
    }
  },
  
  // 获取最近会话
  getRecentChats: function() {
    const db = wx.cloud.database();
    db.collection('chats')
      .orderBy('updateTime', 'desc')
      .limit(5)
      .get()
      .then(res => {
        this.setData({
          recentChats: (res.data || []).map(item => ({
            ...item,
            title: item.title || '工作流记录',
            lastMessage: item.lastMessage || item.question || '继续完善这个任务'
          }))
        });
      })
      .catch(err => {
        console.error('获取最近会话失败', err);
      });
  },

  onPullDownRefresh: function() {
    this.checkUserInfo();
    this.getRecentChats();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 300);
  },

  claimDailyPoints: function() {
    wx.showToast({
      title: '今日已打卡 +2',
      icon: 'none'
    });
  },

  openMembership: function() {
    wx.navigateTo({
      url: '/pages/membership/membership'
    });
  },
  
  // 跳转到会员中心
  goToMembership: function() {
    wx.navigateTo({
      url: '/pages/membership/membership'
    });
  },
  
  // 重新加载页面
  reloadPage: function() {
    this.setData({
      isEmergency: false
    });
    
    // 重新加载数据
    this.onLoad();
  }
}); 
