const {
  addTitleResultsToLibrary,
  buildTitleResults,
  getSourceContext,
  saveTitleResults
} = require('../../../utils/creator-studio');

Page({
  data: {
    sourceContext: null,
    titleStyles: [
      ['冲突型', '数字型', '悬念型'],
      ['圈定人群', '情绪型', '方法型']
    ],
    results: []
  },

  onShow() {
    const sourceContext = getSourceContext();
    const results = buildTitleResults(sourceContext);
    saveTitleResults(results);
    this.setData({ sourceContext, results });
  },

  regenerateBatch() {
    const results = buildTitleResults(this.data.sourceContext || getSourceContext());
    saveTitleResults(results);
    this.setData({ results });
  },

  openLibrary() {
    addTitleResultsToLibrary(this.data.results);
    wx.navigateTo({
      url: '/pages/copywriter/title-library/title-library'
    });
  },

  confirmTitle(e) {
    const { text } = e.currentTarget.dataset;
    if (!text) {
      return;
    }

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '标题已复制', icon: 'none' });
      }
    });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
