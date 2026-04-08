const { generateTopics, loadSession, updateStepData } = require('../../../utils/copywriter-session');

Page({
  data: {
    audienceText: '',
    valueText: '',
    ipText: ''
  },

  onShow() {
    const session = loadSession();
    if (!session) {
      wx.redirectTo({ url: '/pages/copywriter/start/start' });
      return;
    }

    this.setData({
      audienceText: (session.stepData.audienceTags || []).join('、'),
      valueText: session.stepData.valueText || '',
      ipText: session.stepData.ipText || ''
    });
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  fillTemplate(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({ valueText: value });
  },

  generateTopicList() {
    updateStepData({
      audienceTags: (this.data.audienceText || '').split(/[\n,，、]/).map((item) => item.trim()).filter(Boolean),
      valueText: this.data.valueText.trim(),
      ipText: this.data.ipText.trim()
    });
    generateTopics();
    wx.navigateTo({ url: '/pages/copywriter/topics/topics' });
  },

  goBack() {
    wx.navigateBack();
  }
});
