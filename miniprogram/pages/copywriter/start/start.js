const { createSession, getResumeRoute, loadSession } = require('../../../utils/copywriter-session');

Page({
  data: {
    hasDraft: false,
    draftUpdatedAt: '',
    heroCard: {
      title: '开始文案创作',
      description: '6 步完成一轮文案创作，可随时返回修改。'
    },
    flowSteps: [
      { no: '1', label: '关键词', tone: 'violet' },
      { no: '2', label: '灵感', tone: 'blue' },
      { no: '3', label: '知识库', tone: 'purple' },
      { no: '4', label: '选题', tone: 'indigo' },
      { no: '5', label: '文章', tone: 'teal' },
      { no: '6', label: '定稿', tone: 'orange' }
    ],
    prepCards: [
      {
        title: '关键词',
        desc: '先丢进最想写的内容、热点或目标受众'
      },
      {
        title: '想法',
        desc: '补充观点、问题和你真正想表达的角度'
      },
      {
        title: '知识库',
        desc: '准备案例、经历或资料，让文案更有细节'
      }
    ],
    resumeHint: '6 步完成一轮文案创作，可随时返回修改。'
  },

  onShow() {
    const session = loadSession();
    this.setData({
      hasDraft: !!session,
      draftUpdatedAt: session ? this.formatTime(session.lastEditedAt) : '',
      resumeHint: session
        ? `上次编辑：${this.formatTime(session.lastEditedAt)}`
        : '6 步完成一轮文案创作，可随时返回修改。'
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

    wx.redirectTo({ url: getResumeRoute() });
  }
});
