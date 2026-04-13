const {
  buildMomentsDrafts,
  getLastMomentsDrafts,
  getSourceContext,
  saveMomentsDrafts
} = require('../../../utils/creator-studio');

Page({
  data: {
    drafts: [],
    selectedDraftId: ''
  },

  onShow() {
    const drafts = getLastMomentsDrafts().length
      ? getLastMomentsDrafts()
      : buildMomentsDrafts(getSourceContext());
    saveMomentsDrafts(drafts);
    const selectedDraftId = this.data.selectedDraftId || (drafts[0] && drafts[0].id) || '';
    this.setData({ drafts, selectedDraftId });
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

  selectDraft(e) {
    const draftId = e.currentTarget.dataset.id;
    if (!draftId) {
      return;
    }
    this.setData({ selectedDraftId: draftId });
  },

  openEditorPage() {
    if (!this.data.drafts.length) {
      return;
    }
    wx.navigateTo({
      url: `/pages/copywriter/moments-editor/moments-editor?draftId=${this.data.selectedDraftId || this.data.drafts[0].id}`
    });
  },

  useDraft() {
    if (!this.data.drafts.length) {
      return;
    }

    const target =
      this.data.drafts.find((item) => item.id === this.data.selectedDraftId) || this.data.drafts[0];

    wx.setClipboardData({
      data: target.content,
      success: () => {
        wx.showToast({ title: '已复制并可继续使用', icon: 'none' });
      }
    });
  }
});
