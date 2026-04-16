Page({
  data: {
    statusBarHeight: 20,
    heroEyebrow: 'CREATOR READING LIST',
    heroCard: {
      title: '自媒体前沿创作集',
      description: '把值得反复研究的创作方法整理成一份今日精选，方便你直接判断先看什么、再拆什么、最后怎么模仿。'
    },
    heroMetaChips: [
      { text: '6 篇精选', dim: false },
      { text: '今日研究', dim: true }
    ],
    featured: {
      sectionTitle: '本期首推',
      sectionMeta: '建议先读',
      tag: '01 首推',
      title: '油管大神 Dan Koe：一人公司内容路径',
      description: '先研究结构和表达方式，再回到自己的主题里写一版模仿练习。'
    },
    categoryChips: [
      { text: '内容模型', active: true },
      { text: '案例拆解', active: false },
      { text: '创作方法', active: false },
      { text: '一人公司', active: false }
    ],
    readingItems: [
      {
        articleId: 'reading-02',
        index: '02',
        title: '拆解百万博主 Dan Koe 爆文创作系统',
        desc: '适合拆爆文结构和复用段落框架。',
        meta: '12 min 阅读 · 爆文拆解',
        toneClass: 'reading-index-fuchsia',
        metaClass: 'reading-meta-fuchsia'
      },
      {
        articleId: 'reading-03',
        index: '03',
        title: '如何用 AI 做出高价值内容',
        desc: '适合今天直接带着工具做实验。',
        meta: '10 min 阅读 · 工具实验',
        toneClass: 'reading-index-indigo',
        metaClass: 'reading-meta-indigo'
      },
      {
        articleId: 'reading-04',
        index: '04',
        title: '如何用 AI 做出内容产品',
        desc: '把内容、产品和变现视角放在一起看。',
        meta: '14 min 阅读 · 内容产品',
        toneClass: 'reading-index-teal',
        metaClass: 'reading-meta-teal'
      },
      {
        articleId: 'reading-05a',
        index: '05',
        title: '把爆文拆成可复用模板',
        desc: '今天就能按模板写出自己的第一版。',
        meta: '09 min 阅读 · 模板训练',
        toneClass: 'reading-index-orange',
        metaClass: 'reading-meta-orange'
      },
      {
        articleId: 'reading-05b',
        index: '05',
        title: '把爆文拆成可复用模板',
        desc: '今天就能按模板写出自己的第一版。',
        meta: '09 min 阅读 · 模板训练',
        toneClass: 'reading-index-olive',
        metaClass: 'reading-meta-olive'
      },
      {
        articleId: 'reading-05c',
        index: '05',
        title: '把爆文拆成可复用模板',
        desc: '今天就能按模板写出自己的第一版。',
        meta: '09 min 阅读 · 模板训练',
        toneClass: 'reading-index-cyan',
        metaClass: 'reading-meta-cyan'
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

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
      return;
    }
    wx.switchTab({ url: '/pages/index/index' });
  },

  openArticleRead(e) {
    wx.navigateTo({
      url: '/pages/article-detail/article-detail'
    });
  }
});
