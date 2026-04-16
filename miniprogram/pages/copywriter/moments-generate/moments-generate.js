const {
  buildMomentsDrafts,
  getLastMomentsDrafts,
  getSourceContext,
  saveMomentsDrafts
} = require('../../../utils/creator-studio');

const FALLBACK_SOURCE_CONTEXT = {
  articleContent:
    '很多人以为，只要更努力地写，就会慢慢找到自己的节奏。但真实情况往往是：当你没有先解决方向和结构问题时，越努力，只会越拧巴。'
};

Page({
  data: {
    heroCard: {
      kicker: '朋友圈文案',
      title: '基于现有内容，快速生成更适合朋友圈发布的表达版本',
      description: '自动提炼卖点、调整口语感、补足转化收口，输出可直接发布的文案草稿。'
    },
    sourceContext: null,
    variantRows: [
      [
        { text: '认知教育类', tone: 'accent' },
        { text: '痛点共鸣类', tone: 'muted' },
        { text: '方法干货类', tone: 'light' }
      ],
      [
        { text: '案例拆解类', tone: 'muted' },
        { text: '日常真实类', tone: 'violet' },
        { text: '转化成交类', tone: 'light' }
      ]
    ],
    angleRows: [
      [
        { text: '场景开场', tone: 'teal' },
        { text: '对象定位', tone: 'light' }
      ],
      [
        { text: '选择对比', tone: 'light' },
        { text: '选择对比', tone: 'sky' }
      ],
      [
        { text: '成本算账', tone: 'light' },
        { text: '用户互动', tone: 'light' }
      ],
      [
        { text: '过程盘点', tone: 'light' },
        { text: '清单条列', tone: 'light' }
      ]
    ],
    strategyChoices: [
      { text: '认知教育类', tone: 'light' },
      { text: '选择对比', tone: 'sky' }
    ],
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

  regenerateDrafts() {
    const drafts = buildMomentsDrafts(this.data.sourceContext || getSourceContext());
    saveMomentsDrafts(drafts);
    this.setData({ drafts });
  },

  openPreviewPage() {
    wx.navigateTo({
      url: '/pages/copywriter/moments-editor/moments-editor'
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
