const {
  buildMomentsDrafts,
  getLastMomentsDrafts,
  getSourceContext,
  saveMomentsDrafts
} = require('../../../utils/creator-studio');

function getFallbackRecommendations(sourceContext) {
  const topic = (sourceContext && sourceContext.topicTitle) || '这件事';
  return [
    `最近把${topic}这件事重新梳理了一遍，很多卡点其实都能拆开解决。`,
    '先把方向调顺，再追求频率，输出质量会稳定很多。',
    '如果你也在同样阶段，欢迎留言，我把这套思路拆给你。'
  ];
}

Page({
  data: {
    sourceContext: null,
    drafts: [],
    featuredDrafts: [],
    restDrafts: [],
    selectedDraftId: '',
    activeContent: '',
    recommendations: []
  },

  onLoad(options) {
    this.selectedFromPreview = options && options.draftId ? options.draftId : '';
  },

  onShow() {
    const sourceContext = getSourceContext();
    const drafts = getLastMomentsDrafts().length
      ? getLastMomentsDrafts()
      : buildMomentsDrafts(sourceContext);

    const selectedDraftId = this.resolveSelectedDraftId(drafts);
    const activeDraft = drafts.find((item) => item.id === selectedDraftId) || drafts[0] || null;

    this.setData({
      sourceContext,
      drafts,
      featuredDrafts: drafts.slice(0, 3),
      restDrafts: drafts.slice(3),
      selectedDraftId,
      activeContent: activeDraft ? activeDraft.content : '',
      recommendations: this.buildRecommendations(drafts, selectedDraftId, sourceContext)
    });
  },

  resolveSelectedDraftId(drafts) {
    if (!drafts.length) {
      return '';
    }

    if (this.selectedFromPreview && drafts.some((item) => item.id === this.selectedFromPreview)) {
      return this.selectedFromPreview;
    }

    if (this.data.selectedDraftId && drafts.some((item) => item.id === this.data.selectedDraftId)) {
      return this.data.selectedDraftId;
    }

    return drafts[0].id;
  },

  buildRecommendations(drafts, selectedDraftId, sourceContext) {
    const alternatives = drafts
      .filter((item) => item.id !== selectedDraftId)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        text: item.content,
        tag: item.meta || '备选推荐'
      }));

    const staticRows = getFallbackRecommendations(sourceContext).map((text, index) => ({
      id: `fallback-${index + 1}`,
      text,
      tag: '推荐补句'
    }));

    return [...alternatives, ...staticRows].slice(0, 6);
  },

  selectDraft(e) {
    const draftId = e.currentTarget.dataset.id;
    if (!draftId || draftId === this.data.selectedDraftId) {
      return;
    }

    this.persistActiveContent();

    const nextDraft = this.data.drafts.find((item) => item.id === draftId);
    this.setData({
      selectedDraftId: draftId,
      activeContent: nextDraft ? nextDraft.content : '',
      recommendations: this.buildRecommendations(this.data.drafts, draftId, this.data.sourceContext)
    });
  },

  handleContentInput(e) {
    this.setData({ activeContent: e.detail.value || '' });
  },

  pasteFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        const text = (res.data || '').trim();
        if (!text) {
          wx.showToast({ title: '剪贴板为空', icon: 'none' });
          return;
        }

        const nextContent = this.data.activeContent
          ? `${this.data.activeContent}\n${text}`
          : text;
        this.setData({ activeContent: nextContent });
        wx.showToast({ title: '已粘贴到编辑区', icon: 'none' });
      },
      fail: () => {
        wx.showToast({ title: '读取剪贴板失败', icon: 'none' });
      }
    });
  },

  copyCurrent() {
    const content = (this.data.activeContent || '').trim();
    if (!content) {
      wx.showToast({ title: '暂无可复制内容', icon: 'none' });
      return;
    }

    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({ title: '当前文案已复制', icon: 'none' });
      }
    });
  },

  applyRecommendation(e) {
    const text = e.currentTarget.dataset.text;
    const mode = e.currentTarget.dataset.mode;
    if (!text) {
      return;
    }

    const nextContent = mode === 'replace' ? text : `${this.data.activeContent || ''}\n${text}`.trim();
    this.setData({ activeContent: nextContent });
  },

  saveCurrentVersion() {
    const updatedDrafts = this.persistActiveContent();
    if (!updatedDrafts.length) {
      wx.showToast({ title: '暂无可保存文案', icon: 'none' });
      return;
    }
    wx.showToast({ title: '已保存当前修改', icon: 'none' });
  },

  persistActiveContent() {
    const { drafts, selectedDraftId, activeContent } = this.data;
    if (!drafts.length || !selectedDraftId) {
      return drafts;
    }

    const normalized = (activeContent || '').trim();
    const updatedDrafts = drafts.map((item) =>
      item.id === selectedDraftId
        ? {
            ...item,
            content: normalized || item.content
          }
        : item
    );

    saveMomentsDrafts(updatedDrafts);
    this.setData({
      drafts: updatedDrafts,
      featuredDrafts: updatedDrafts.slice(0, 3),
      restDrafts: updatedDrafts.slice(3),
      recommendations: this.buildRecommendations(updatedDrafts, selectedDraftId, this.data.sourceContext)
    });
    return updatedDrafts;
  },

  goBackToPreview() {
    this.persistActiveContent();
    wx.navigateBack({ delta: 1 });
  },

  goBackToGenerate() {
    this.persistActiveContent();
    const pages = getCurrentPages();
    if (pages.length >= 3) {
      wx.navigateBack({ delta: 2 });
      return;
    }

    wx.redirectTo({
      url: '/pages/copywriter/moments-generate/moments-generate'
    });
  }
});
