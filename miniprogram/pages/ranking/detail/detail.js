Page({
  data: {
    statusBarHeight: 20,
    rankingRows: [
      {
        index: '01',
        title: '排名热榜 · AI 副业变道避坑手册',
        meta: '优势：热度高、评论活跃，适合先做趋势判断与避坑拆解。',
        toneClass: 'row-index-violet'
      },
      {
        index: '02',
        title: '低粉爆款榜 · 小切口案例复盘更容易起量',
        meta: '优势：适合今天先拆爆款结构，再决定自己的表达版本。',
        toneClass: 'row-index-slate'
      },
      {
        index: '03',
        title: '高涨粉榜 · 强观点开场 + 具体案例组合仍有效',
        meta: '优势：更适合用来判断今天要不要先做强粉向内容。',
        toneClass: 'row-index-amber'
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
