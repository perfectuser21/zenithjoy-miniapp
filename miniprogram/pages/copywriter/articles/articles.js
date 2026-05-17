const {
  generateArticles,
  getTopic,
  loadSession,
  setArticles,
  setCurrentStep
} = require('../../../utils/copywriter-session');
const { generateArticlesWithAI } = require('../../../services/copywriter-ai');
const { checkQuota } = require('../../../utils/membership');

const VERSION_TAGS = ['版本A', '版本B', '版本C'];
const META_BY_VARIANT = {
  tutorial: '价值表达 · 适合直接发布',
  opinion: '口语轻松 · 适合朋友圈互动',
  story: '结果导向 · 适合转化收口'
};

function normalizePreviewText(content) {
  return (content || '').replace(/\n+/g, ' ').trim();
}

function buildPreviewCards(articles) {
  return (articles || []).map((article, index) => {
    const versionTag = VERSION_TAGS[index] || `版本${index + 1}`;
    const metaText = META_BY_VARIANT[article.variantType] || `${article.variantLabel} · 适合直接发布`;
    const previewText = normalizePreviewText(article.preview200 || article.content || '');

    return {
      ...article,
      versionTag,
      metaText,
      previewText: `${versionTag}：${previewText}`
    };
  });
}

Page({
  data: {
    heroCard: {
      kicker: 'STEP 5 · 文案版本',
      title: '先看结构，再决定用哪一个版本',
      description: '已基于当前选题生成多个文案版本，支持滑动预览并确认使用。'
    },
    topicId: '',
    topic: null,
    articles: [],
    previewCards: [],
    selectedArticleId: '',
    selectedArticle: null,
    generating: false
  },

  onLoad(options) {
    this.setData({ topicId: options.topicId || '' });
  },

  async onShow() {
    const session = loadSession();
    if (!session || !this.data.topicId) {
      wx.redirectTo({ url: '/pages/copywriter/start/start' });
      return;
    }

    const topic = getTopic(session, this.data.topicId);
    const articles = (session.articlesByTopic || {})[this.data.topicId] || [];

    this.setData({ topic, articles });
    setCurrentStep(5, { topicId: this.data.topicId, articleId: '' });

    if (!articles.length) {
      await this.generateWithAI(true);
      return;
    }

    this.refreshPage();
  },

  refreshPage() {
    const session = loadSession();
    if (!session) {
      return;
    }

    const articles = (session.articlesByTopic || {})[this.data.topicId] || [];
    const previewCards = buildPreviewCards(articles);
    const selectedArticleId = this.data.selectedArticleId || (previewCards[0] && previewCards[0].articleId) || '';
    const selectedArticle = previewCards.find((item) => item.articleId === selectedArticleId) || previewCards[0] || null;

    this.setData({
      heroCard: {
        kicker: 'STEP 5 · 某个选题下生成 3 篇文章',
        title: '先看结构，再决定用哪一个版本',
        description: `已基于当前选题生成${previewCards.length}个文案版本，支持滑动预览并确认使用。`
      },
      topic: getTopic(session, this.data.topicId),
      articles,
      previewCards,
      selectedArticleId: selectedArticle ? selectedArticle.articleId : '',
      selectedArticle
    });
  },

  async generateWithAI(useLoading = true) {
    if (!(await checkQuota())) {
      return;
    }

    const session = loadSession();
    const topic = getTopic(session || {}, this.data.topicId);
    if (!session || !topic) {
      return;
    }

    if (useLoading) {
      this.setData({ generating: true });
      wx.showLoading({ title: '生成文案中...', mask: true });
    }

    try {
      const articles = await generateArticlesWithAI(session.stepData, topic);
      if (!articles.length) {
        throw new Error('未生成到有效文案');
      }
      setArticles(this.data.topicId, articles);
      this.refreshPage();
    } catch (error) {
      console.error('AI 生成文案失败，回退本地结果:', error);
      generateArticles(this.data.topicId);
      this.refreshPage();
      wx.showToast({ title: 'AI 生成失败，已使用默认文案', icon: 'none' });
    } finally {
      if (useLoading) {
        wx.hideLoading();
      }
      this.setData({ generating: false });
    }
  },

  selectArticle(e) {
    const { id } = e.currentTarget.dataset;
    if (!id || id === this.data.selectedArticleId) {
      return;
    }

    const selectedArticle = this.data.previewCards.find((item) => item.articleId === id) || null;
    this.setData({
      selectedArticleId: id,
      selectedArticle
    });
  },

  openArticleDetail(e) {
    const articleId = e?.currentTarget?.dataset?.id || this.data.selectedArticleId;
    if (!articleId) {
      return;
    }

    this.setData({ selectedArticleId: articleId });
    setCurrentStep(6, { topicId: this.data.topicId, articleId });
    wx.navigateTo({
      url: `/pages/copywriter/article-detail/article-detail?topicId=${this.data.topicId}&articleId=${articleId}`
    });
  },

  useSelected() {
    this.openArticleDetail();
  },

  goBack() {
    wx.redirectTo({ url: '/pages/copywriter/topics/topics' });
  }
});
