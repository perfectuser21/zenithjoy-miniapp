const { getArticle, loadSession, setCurrentStep, updateArticle } = require('../../../utils/copywriter-session');

Page({
  data: {
    topicId: '',
    articleId: '',
    article: null,
    saveStatus: '内容已自动保存'
  },

  onLoad(options) {
    this.setData({
      topicId: options.topicId || '',
      articleId: options.articleId || ''
    });
  },

  onShow() {
    this.refresh();
  },

  onUnload() {
    this.flushSave();
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
  },

  refresh() {
    const session = loadSession();
    if (!session || !this.data.topicId || !this.data.articleId) {
      wx.redirectTo({ url: '/pages/copywriter/start/start' });
      return;
    }

    const article = getArticle(session, this.data.topicId, this.data.articleId);
    this.setData({ article });
    setCurrentStep(6, {
      topicId: this.data.topicId,
      articleId: this.data.articleId
    });
  },

  handleTitleInput(e) {
    this.setData({ 'article.title': e.detail.value });
    this.scheduleSave();
  },

  handleContentInput(e) {
    this.setData({ 'article.content': e.detail.value });
    this.scheduleSave();
  },

  scheduleSave() {
    this.setData({ saveStatus: '正在保存修改...' });
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.flushSave();
    }, 800);
  },

  flushSave() {
    if (!this.data.article) {
      return;
    }

    updateArticle(this.data.topicId, this.data.articleId, {
      title: this.data.article.title,
      content: this.data.article.content
    });
    this.setData({ saveStatus: '已自动保存' });
  },

  copyArticle() {
    const article = this.data.article;
    wx.setClipboardData({ data: `${article.title}\n\n${article.content}` });
  },

  exportArticle() {
    const article = this.data.article;
    wx.setClipboardData({
      data: `${article.title}\n\n${article.content}`,
      success: () => {
        wx.showToast({ title: '已复制为纯文本', icon: 'none' });
      }
    });
  },

  triggerAssist(e) {
    const { type } = e.currentTarget.dataset;
    const labels = {
      spoken: '更口语',
      pro: '更专业',
      titles: '备选标题',
      summary: '摘要'
    };
    wx.showToast({
      title: `${labels[type] || 'AI 辅助'}稍后接入`,
      icon: 'none'
    });
  },

  goBack() {
    wx.redirectTo({ url: '/pages/copywriter/articles/articles?topicId=' + this.data.topicId });
  }
});
