const {
  buildMomentsDrafts,
  getLastMomentsDrafts,
  getSourceContext,
  saveMomentsDrafts
} = require('../../../utils/creator-studio');

const FALLBACK_SOURCE_CONTEXT = {
  articleContent:
    '很多人以为，只要更努力地写，就会慢慢找到自己的节奏。'
};

const VARIANT_ROWS = [
  [
    { id: 'variant-education', text: '认知教育类', activeTone: 'accent' },
    { id: 'variant-pain', text: '痛点共鸣类', activeTone: 'accent' },
    { id: 'variant-method', text: '方法干货类', activeTone: 'accent' }
  ],
  [
    { id: 'variant-case', text: '案例拆解类', activeTone: 'accent' },
    { id: 'variant-daily', text: '日常真实类', activeTone: 'violet' },
    { id: 'variant-convert', text: '转化成交类', activeTone: 'accent' }
  ]
];

const ANGLE_ROWS = [
  [
    { id: 'angle-scene', text: '场景开场', activeTone: 'teal' },
    { id: 'angle-audience', text: '对象定位', activeTone: 'sky' }
  ],
  [
    { id: 'angle-choice-plain', text: '选择对比', activeTone: 'sky' },
    { id: 'angle-choice-sky', text: '选择对比', activeTone: 'sky' }
  ],
  [
    { id: 'angle-cost', text: '成本算账', activeTone: 'sky' },
    { id: 'angle-interaction', text: '用户互动', activeTone: 'sky' }
  ],
  [
    { id: 'angle-process', text: '过程盘点', activeTone: 'sky' },
    { id: 'angle-list', text: '清单条列', activeTone: 'sky' }
  ]
];

function buildChipRows(rows, selectedId) {
  return rows.map((row) =>
    row.map((item) => ({
      ...item,
      className: item.id === selectedId ? `chip chip-${item.activeTone}` : 'chip chip-light'
    }))
  );
}

Page({
  data: {
    heroCard: {
      kicker: '朋友圈文案',
      title: '基于现有内容，快速生成更适合朋友圈发布的表达版本',
      description: '自动提炼卖点、调整口语感、补足转化收口，输出可直接发布的文案草稿。'
    },
    sourceTitle: '内容想法',
    sourceMeta: '当前文案想法',
    variantTitle: '六大文案框架',
    angleTitle: '表达角度',
    sourceContext: FALLBACK_SOURCE_CONTEXT,
    selectedVariant: '认知教育类',
    selectedVariantId: 'variant-education',
    selectedAngle: '场景开场',
    selectedAngleId: 'angle-scene',
    variantRows: buildChipRows(VARIANT_ROWS, 'variant-education'),
    angleRows: buildChipRows(ANGLE_ROWS, 'angle-scene'),
    drafts: []
  },

  onShow() {
    const sourceContext = getSourceContext() || FALLBACK_SOURCE_CONTEXT;
    const drafts = getLastMomentsDrafts().length
      ? getLastMomentsDrafts()
      : buildMomentsDrafts(sourceContext);
    saveMomentsDrafts(drafts);
    this.setData({ sourceContext, drafts });
  },

  handleSourceInput(e) {
    const articleContent = e?.detail?.value || '';
    this.setData({
      sourceContext: {
        ...(this.data.sourceContext || FALLBACK_SOURCE_CONTEXT),
        articleContent
      }
    });
  },

  selectVariant(e) {
    const selectedVariantId = e?.currentTarget?.dataset?.id || '';
    const selectedVariant = e?.currentTarget?.dataset?.value || '';
    if (!selectedVariantId || !selectedVariant) {
      return;
    }

    this.setData({
      selectedVariantId,
      selectedVariant,
      variantRows: buildChipRows(VARIANT_ROWS, selectedVariantId)
    });
  },

  selectAngle(e) {
    const selectedAngleId = e?.currentTarget?.dataset?.id || '';
    const selectedAngle = e?.currentTarget?.dataset?.value || '';
    if (!selectedAngleId || !selectedAngle) {
      return;
    }

    this.setData({
      selectedAngleId,
      selectedAngle,
      angleRows: buildChipRows(ANGLE_ROWS, selectedAngleId)
    });
  },

  regenerateDrafts() {
    const drafts = buildMomentsDrafts(this.data.sourceContext || getSourceContext());
    saveMomentsDrafts(drafts);
    this.setData({ drafts });
  },

  openPreviewPage() {
    this.regenerateDrafts();
    const drafts = this.data.drafts || [];
    const firstDraft = drafts[0];
    wx.navigateTo({
      url: `/pages/copywriter/moments-editor/moments-editor?draftId=${firstDraft ? firstDraft.id : ''}`
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
