Page({
  data: {
    statusBarHeight: 20,
    heroTitle: '追踪今天最值得跟进的热点、低粉爆款和涨粉方向',
    heroDescription: '从实时热度、互动表现和转化潜力三个维度，帮助你决定今天先拆哪一类内容。',
    metrics: [
      { value: '24h', label: '热度刷新' },
      { value: '03', label: '榜单分类' },
      { value: '实时', label: '更新状态' }
    ],
    filterTitle: '榜单筛选',
    filterHint: '按类型切换',
    filters: [
      { key: 'hot', label: '热点榜', active: true },
      { key: 'low', label: '低粉爆款', active: false },
      { key: 'grow', label: '高涨粉榜', active: false }
    ],
    topListTitle: '热点榜单',
    topListHint: '一句话热点',
    rankingItems: [
      {
        index: '01',
        title: 'AI 副业赛道继续升温，副业干货和经验复盘仍然最容易拿到关注。'
      },
      {
        index: '02',
        title: '小切口案例复盘继续活跃，真实经历类表达更容易带来停留和转发。'
      },
      {
        index: '03',
        title: '强观点开场加具体案例依然有效，涨粉向内容今天仍有不错机会。'
      },
      {
        index: '04',
        title: '争议观点复盘类内容还在扩散，适合今天做观点拆解和二次表达。'
      },
      {
        index: '05',
        title: '小样本高互动内容值得优先观察，轻结构模仿今天更容易快速起稿。'
      },
      {
        index: '06',
        title: '小样本高互动内容值得优先观察，轻结构模仿今天更容易快速起稿。'
      },
      {
        index: '07',
        title: '小样本高互动内容值得优先观察，轻结构模仿今天更容易快速起稿。'
      }
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

  switchFilter(e) {
    const { key } = e.currentTarget.dataset;
    if (!key) {
      return;
    }
    this.setData({
      filters: this.data.filters.map((item) => ({
        ...item,
        active: item.key === key
      }))
    });
  },

  goBackHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
      return;
    }
    this.goBackHome();
  }
});
