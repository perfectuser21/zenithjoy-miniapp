const {
  getSourceContext,
  saveMomentsDrafts
} = require('../../../utils/creator-studio');

const FALLBACK_DRAFTS = [
  {
    id: 'fallback-moments-1',
    content:
      '最近把内容方向重新梳理了一遍，发现很多卡点都不是努力不够，而是方向和结构没先调顺。先把主线定清楚，再去写具体表达，整条文案会顺很多。',
    meta: '当前选中 · 优势：开头抓人 + 结构完整 + 生活化表达'
  },
  {
    id: 'fallback-moments-2',
    content:
      '不是你没有素材，而是表达顺序容易乱。先说结论，再补原因，最后给一个可执行动作，读者会更容易跟上你的节奏。',
    meta: '优势：观点先行，逻辑递进清楚，适合建立专业感'
  },
  {
    id: 'fallback-moments-3',
    content:
      '方向清晰之后，发布频率自然会稳定。你不用每次都从零开始，只要沿着同一主题持续输出，内容就会越来越有辨识度。',
    meta: '优势：节奏稳定，长期连载友好，易形成内容系列'
  },
  {
    id: 'fallback-moments-4',
    content:
      '很多时候写不出来，不是没想法，而是还没把要表达的重点捋清楚。先把一句核心观点写出来，再往下展开会轻松很多。',
    meta: '优势：口语自然，亲近感强，评论互动门槛低'
  }
];

function buildRankedDrafts(drafts) {
  return (Array.isArray(drafts) ? drafts : []).map((item) => ({
    ...item
  }));
}

Page({
  data: {
    heroCard: {
      kicker: '下一步：定稿',
      title: '选文案，再精修定稿',
      description: '点击列表切换，编辑区即时改写。'
    },
    previewTitle: '文案列表',
    previewMeta: '点击卡片切换，查看每条优势',
    editorTitle: '选中文案（可编辑）',
    editorMeta: '支持粘贴、保存与复制',
    sourceContext: null,
    drafts: [],
    rankedDrafts: [],
    selectedDraftId: '',
    activeContent: '',
    scrollTop: 0,
    scrollOffset: 0,
    maxScrollOffset: 0,
    railTravel: 0,
    thumbTop: 0,
    draftListStyle: '',
    scrollThumbStyle: '',
    guideChips: []
  },

  onLoad(options) {
    this.selectedFromPreview = options && options.draftId ? options.draftId : '';
  },

  onShow() {
    const sourceContext = getSourceContext() || {};
    const normalizedDrafts = this.normalizeDrafts(FALLBACK_DRAFTS);

    const selectedDraftId = this.resolveSelectedDraftId(normalizedDrafts);
    const activeDraft = normalizedDrafts.find((item) => item.id === selectedDraftId) || normalizedDrafts[0] || null;

    saveMomentsDrafts(normalizedDrafts);
    this.setData({
      sourceContext,
      drafts: normalizedDrafts,
      rankedDrafts: buildRankedDrafts(normalizedDrafts),
      selectedDraftId,
      activeContent: activeDraft ? activeDraft.content : '',
      scrollTop: 0,
      scrollOffset: 0,
      maxScrollOffset: 0,
      railTravel: 0,
      thumbTop: 0,
      draftListStyle: this.buildDraftListStyle(0),
      scrollThumbStyle: this.buildScrollThumbStyle(0)
    });
    this.measureDraftViewport();
  },

  normalizeDrafts(drafts) {
    const existing = Array.isArray(drafts) ? drafts.slice() : [];
    if (existing.length >= 4) {
      return existing;
    }

    const usedIds = new Set(existing.map((item) => item.id));
    const fillers = FALLBACK_DRAFTS.filter((item) => !usedIds.has(item.id));
    return [...existing, ...fillers].slice(0, 4);
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

  selectDraft(e) {
    const draftId = e.currentTarget.dataset.id;
    if (!draftId || draftId === this.data.selectedDraftId) {
      return;
    }

    this.persistActiveContent();

    const nextDraft = this.data.drafts.find((item) => item.id === draftId);
    this.setData({
      selectedDraftId: draftId,
      activeContent: nextDraft ? nextDraft.content : ''
    });
  },

  handleContentInput(e) {
    this.setData({ activeContent: e.detail.value || '' });
  },

  handleScrollThumbStart(e) {
    const touch = e.touches && e.touches[0];
    this.dragStartY = touch ? touch.clientY : 0;
    this.dragStartThumbTop = this.data.thumbTop || 0;
  },

  handleScrollThumbMove(e) {
    const touch = e.touches && e.touches[0];
    if (!touch) {
      return;
    }

    const deltaY = touch.clientY - (this.dragStartY || 0);
    this.syncThumbTop((this.dragStartThumbTop || 0) + deltaY);
  },

  handleScrollRailTap(e) {
    const localY = e && e.detail && typeof e.detail.y === 'number' ? e.detail.y : 0;
    this.syncThumbTop(localY - 24);
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
      rankedDrafts: buildRankedDrafts(updatedDrafts),
      draftListStyle: this.buildDraftListStyle(this.data.scrollOffset || 0),
      scrollThumbStyle: this.buildScrollThumbStyle(this.data.thumbTop || 0)
    });
    this.measureDraftViewport();
    return updatedDrafts;
  },

  measureDraftViewport() {
    if (!wx.createSelectorQuery) {
      return;
    }

    const query = wx.createSelectorQuery();
    query.select('.draft-list').boundingClientRect();
    query.select('.draft-track').boundingClientRect();
    query.select('.scroll-rail').boundingClientRect();
    query.select('.scroll-thumb').boundingClientRect();
    query.exec((res) => {
      const listRect = res && res[0];
      const trackRect = res && res[1];
      const railRect = res && res[2];
      const thumbRect = res && res[3];

      if (!listRect || !trackRect || !railRect || !thumbRect) {
        return;
      }

      const maxScrollOffset = Math.max(trackRect.height - listRect.height, 0);
      const railTravel = Math.max(railRect.height - thumbRect.height, 0);
      const scrollOffset = Math.max(0, Math.min(this.data.scrollOffset || 0, maxScrollOffset));
      const thumbTop = this.mapOffsetToThumb(scrollOffset, maxScrollOffset, railTravel);

      this.setData({
        maxScrollOffset,
        railTravel,
        scrollOffset,
        thumbTop,
        draftListStyle: this.buildDraftListStyle(scrollOffset),
        scrollThumbStyle: this.buildScrollThumbStyle(thumbTop)
      });
    });
  },

  mapOffsetToThumb(offset, maxScrollOffset = this.data.maxScrollOffset || 0, railTravel = this.data.railTravel || 0) {
    if (!maxScrollOffset || !railTravel) {
      return 0;
    }

    return (Math.max(0, Math.min(offset, maxScrollOffset)) / maxScrollOffset) * railTravel;
  },

  mapThumbToOffset(thumbTop) {
    const { maxScrollOffset, railTravel } = this.data;
    if (!maxScrollOffset || !railTravel) {
      return 0;
    }

    return (Math.max(0, Math.min(thumbTop, railTravel)) / railTravel) * maxScrollOffset;
  },

  buildDraftListStyle(offset) {
    return `transform: translateY(-${Math.max(0, offset || 0)}px);`;
  },

  buildScrollThumbStyle(top) {
    return `transform: translateY(${Math.max(0, top || 0)}px);`;
  },

  syncThumbTop(top) {
    const safeTop = Math.max(0, Math.min(top, this.data.railTravel || 0));
    const scrollOffset = this.mapThumbToOffset(safeTop);
    this.setData({
      thumbTop: safeTop,
      scrollOffset,
      draftListStyle: this.buildDraftListStyle(scrollOffset),
      scrollThumbStyle: this.buildScrollThumbStyle(safeTop)
    });
  },

  goBackToGenerate() {
    this.persistActiveContent();
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
      return;
    }

    wx.redirectTo({
      url: '/pages/copywriter/moments-generate/moments-generate'
    });
  }
});
