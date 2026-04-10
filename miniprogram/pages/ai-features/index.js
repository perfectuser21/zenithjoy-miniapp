Page({
  data: {
    statusBarHeight: 20,
    points: 128,
    creationSteps: [
      { no: '1', label: '关键词', badgeColor: '#6D63FF' },
      { no: '2', label: '灵感', badgeColor: '#4C7AF1' },
      { no: '3', label: '知识库', badgeColor: '#7A4EDC' },
      { no: '4', label: '选题', badgeColor: '#5B67E7' }
    ],
    titleActions: [
      { label: '冲突型' },
      { label: '数字型' },
      { label: '悬念型' },
      { label: '圈定人群' },
      { label: '情绪型' },
      { label: '方法型' }
    ],
    momentActions: [
      { label: '价值表达' },
      { label: '建立共鸣' },
      { label: '轻度转化' }
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

  openCopywriterFlow() {
    wx.navigateTo({
      url: '/pages/copywriter/start/start'
    });
  },

  openTitleStudio() {
    wx.navigateTo({
      url: '/pages/copywriter/title-generate/title-generate'
    });
  },

  openMomentsStudio() {
    wx.navigateTo({
      url: '/pages/copywriter/moments-generate/moments-generate'
    });
  }
});
