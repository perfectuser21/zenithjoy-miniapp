const {
  generateArticles,
  getTopic,
  loadSession,
  regenerateArticle,
  setArticles,
  setCurrentStep
} = require('../../../utils/copywriter-session');
const { generateArticlesWithAI } = require('../../../services/copywriter-ai');
const { checkQuota } = require('../../../utils/membership');

Page({
  data: {
    topicId: '',
    topic: null,
    articles: [],
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
    }
  },

  refreshPage() {
    const session = loadSession();
    if (!session) {
      return;
    }

    this.setData({
      topic: getTopic(session, this.data.topicId),
      articles: (session.articlesByTopic || {})[this.data.topicId] || []
    });
  },

  async generateWithAI(useLoading = true) {
    if (!(await checkQuota())) return;

    const session = loadSession();
    const topic = getTopic(session || {}, this.data.topicId);
    if (!session || !topic) {
      return;
    }

    if (useLoading) {
      this.setData({ generating: true });
      wx.showLoading({ title: '生成文章中...', mask: true });
    }

    try {
      const articles = await generateArticlesWithAI(session.stepData, topic);
      if (!articles.length) {
        throw new Error('未生成到有效文章');
      }
      setArticles(this.data.topicId, articles);
      this.refreshPage();
    } catch (error) {
      console.error('AI 生成文章失败，回退本地结果:', error);
      generateArticles(this.data.topicId);
      this.refreshPage();
      wx.showToast({ title: 'AI 生成失败，已使用默认文章', icon: 'none' });
    } finally {
      if (useLoading) {
        wx.hideLoading();
      }
      this.setData({ generating: false });
    }
  },

  regenerateOne(e) {
    regenerateArticle(this.data.topicId, e.currentTarget.dataset.id);
    this.refreshPage();
    wx.showToast({ title: '已重生成当前文章', icon: 'none' });
  },

  copyPreview(e) {
    const articleId = e.currentTarget.dataset.id;
    const article = (this.data.articles || []).find((item) => item.articleId === articleId);
    if (!article) {
      return;
    }

    wx.setClipboardData({
      data: `${article.title}\n\n${article.preview200}`,
      success: () => {
        wx.showToast({ title: '已复制预览', icon: 'none' });
      }
    });
  },

  openDetail(e) {
    const { id } = e.currentTarget.dataset;
     setCurrentStep(6, { topicId: this.data.topicId, articleId: id });
    wx.navigateTo({ url: `/pages/copywriter/article-detail/article-detail?topicId=${this.data.topicId}&articleId=${id}` });
  },

  regenerateAll() {
    this.generateWithAI(true);
  },

  goBack() {
    wx.navigateBack();
  }
});
