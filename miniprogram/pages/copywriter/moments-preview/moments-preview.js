const {
  buildMomentsDrafts,
  getLastMomentsDrafts,
  getSourceContext,
  saveMomentsDrafts
} = require('../../../utils/creator-studio');

Page({
  data: {
    drafts: []
  },

  onShow() {
    const drafts = getLastMomentsDrafts().length
      ? getLastMomentsDrafts()
      : buildMomentsDrafts(getSourceContext());
    saveMomentsDrafts(drafts);
    this.setData({ drafts });
  },

  regenerateDrafts() {
    const drafts = buildMomentsDrafts(getSourceContext());
    saveMomentsDrafts(drafts);
    this.setData({ drafts });
  },

  copyDraft(e) {
    const { content } = e.currentTarget.dataset;
    if (!content) {
      return;
    }

    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({ title: '文案已复制', icon: 'none' });
      }
    });
  },

  useDraft() {
    if (!this.data.drafts.length) {
      return;
    }

    wx.setClipboardData({
      data: this.data.drafts[0].content,
      success: () => {
        wx.showToast({ title: '已复制并可继续使用', icon: 'none' });
      }
    });
  }
});
