Page({
  data: {
    statusBarHeight: 20,
    items: [
      {
        index: '02',
        title: '拆解百万博主 Dan Koe 爆文创作系统',
        desc: '适合拆爆文结构和复用段落框架。',
        meta: '12 min 阅读 · 爆文拆解',
        toneClass: 'item-index-fuchsia'
      },
      {
        index: '03',
        title: '如何用 AI 做出高价值内容',
        desc: '适合今天直接带着工具做实验。',
        meta: '10 min 阅读 · 工具实验',
        toneClass: 'item-index-indigo'
      },
      {
        index: '04',
        title: '如何用 AI 做出内容产品',
        desc: '把内容、产品和变现视角放在一起看。',
        meta: '14 min 阅读 · 内容产品',
        toneClass: 'item-index-teal'
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
  }
});
