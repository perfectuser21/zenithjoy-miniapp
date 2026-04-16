const { generateTopics, loadSession, updateStepData } = require('../../../utils/copywriter-session');

Page({
  data: {
    heroCard: {
      kicker: 'STEP 3 · 写给谁 / 有价值 / 你是谁',
      title: '把知识库里的核心约束补全',
      description: '目标人群、价值和 IP 背书，会直接决定后面的选题质量。'
    },
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
