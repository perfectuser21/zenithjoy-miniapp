const { createSession, getResumeRoute, loadSession } = require('../../../utils/copywriter-session');

Page({
  data: {
    hasDraft: false,
    draftUpdatedAt: ''
  },

  onShow() {
    const session = loadSession();
    this.setData({
      hasDraft: !!session,
      draftUpdatedAt: session ? this.formatTime(session.lastEditedAt) : ''
    });
  },

  formatTime(timestamp) {
    const date = new Date(timestamp || Date.now());
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
  },

  startCreation() {
    createSession();
    wx.navigateTo({ url: '/pages/copywriter/keywords/keywords' });
  },

  continueDraft() {
    const session = loadSession();
    if (!session) {
      wx.showToast({ title: '暂无可继续的草稿', icon: 'none' });
      return;
    }

    wx.navigateTo({ url: getResumeRoute(session) });
  }
});
