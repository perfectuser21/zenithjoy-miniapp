const {
  buildMomentsDrafts,
  getLastMomentsDrafts,
  getSourceContext,
  saveMomentsDrafts
} = require('../../../utils/creator-studio');

Page({
  data: {
    sourceContext: null,
    strategyRows: [
      ['价值表达', '建立共鸣', '轻度转化'],
      ['口语表达', '观点先行', '结尾收口']
    ],
    drafts: []
  },

  onShow() {
    const sourceContext = getSourceContext();
    const drafts = getLastMomentsDrafts().length
      ? getLastMomentsDrafts()
      : buildMomentsDrafts(sourceContext);
    saveMomentsDrafts(drafts);
    this.setData({ sourceContext, drafts });
  },

  regenerateDrafts() {
    const drafts = buildMomentsDrafts(this.data.sourceContext || getSourceContext());
    saveMomentsDrafts(drafts);
    this.setData({ drafts });
  },

  openPreviewPage() {
    wx.navigateTo({
      url: '/pages/copywriter/moments-preview/moments-preview'
    });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
