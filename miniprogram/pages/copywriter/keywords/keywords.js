const { loadSession, updateStepData } = require('../../../utils/copywriter-session');

Page({
  data: {
    keywordsText: ''
  },

  onShow() {
    const session = loadSession();
    if (!session) {
      wx.redirectTo({ url: '/pages/copywriter/start/start' });
      return;
    }

    this.setData({ keywordsText: session.stepData.keywordsText || '' });
  },

  handleInput(e) {
    this.setData({ keywordsText: e.detail.value });
  },

  useSample() {
    this.setData({ keywordsText: '副业赚钱\n小红书起号\n普通人为什么做内容总是坚持不下去' });
  },

  saveAndNext() {
    const keywordsText = (this.data.keywordsText || '').trim();
    if (!keywordsText) {
      wx.showToast({ title: '请至少输入 1 个关键词或热点信息', icon: 'none' });
      return;
    }

    updateStepData({ keywordsText });
    wx.navigateTo({ url: '/pages/copywriter/ideas/ideas' });
  },

  skipStep() {
    updateStepData({ keywordsText: this.data.keywordsText.trim() });
    wx.navigateTo({ url: '/pages/copywriter/ideas/ideas' });
  }
});
