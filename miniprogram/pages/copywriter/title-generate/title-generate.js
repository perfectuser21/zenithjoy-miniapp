const {
  addTitleResultsToLibrary,
  buildTitleResults,
  getSourceContext,
  saveTitleResults
} = require('../../../utils/creator-studio');

Page({
  data: {
    heroCard: {
      kicker: '标题创作',
      title: '围绕现有内容，快速筛出更想点开的标题',
      description: '支持切换风格、重生成、锁定候选版本。'
    },
    sourceContext: null,
    titleStyles: [
      ['冲突型', '数字型', '悬念型'],
      ['圈定人群', '情绪型', '方法型']
    ],
    results: [],
    visibleResults: [],
    activeStyle: '冲突型',
    activeResultId: ''
  },

  onShow() {
    this.refreshResults();
  },

  refreshResults() {
    const sourceContext = getSourceContext();
    const results = buildTitleResults(sourceContext);
    saveTitleResults(results);
    this.setData({
      sourceContext,
      results,
      visibleResults: results.slice(0, 3),
      activeResultId: results[0] ? results[0].id : ''
    });
  },

  handleStyleSelect(e) {
    const { style } = e.currentTarget.dataset;
    if (!style) {
      return;
    }

    this.setData({ activeStyle: style });
  },

  selectResult(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      return;
    }

    this.setData({ activeResultId: id });
  },

  regenerateBatch() {
    this.refreshResults();
  },

  openLibrary() {
    addTitleResultsToLibrary(this.data.results);
    wx.navigateTo({
      url: '/pages/copywriter/title-library/title-library'
    });
  },

  confirmTitle() {
    const selected = this.data.results.find((item) => item.id === this.data.activeResultId) || this.data.results[0];
    if (!selected || !selected.text) {
      return;
    }

    wx.setClipboardData({
      data: selected.text,
      success: () => {
        wx.showToast({ title: '标题已复制', icon: 'none' });
      }
    });
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
      return;
    }

    wx.switchTab({ url: '/pages/ai-features/index' });
  }
});
