const { loadSession, updateStepData } = require('../../../utils/copywriter-session');

const STYLE_TAGS = ['口语化', '专业', '犀利', '治愈', '故事化', '实操型'];

function buildStyleOptions(selectedTags) {
  return STYLE_TAGS.map((label) => ({
    label,
    active: selectedTags.indexOf(label) > -1,
    className: selectedTags.indexOf(label) > -1 ? 'chip chip-active' : 'chip'
  }));
}

Page({
  data: {
    ideasText: '',
    constraintsText: '',
    styleTags: [],
    styleOptions: buildStyleOptions([]),
    saveStatus: '内容已自动保存'
  },

  onShow() {
    const session = loadSession();
    if (!session) {
      wx.redirectTo({ url: '/pages/copywriter/start/start' });
      return;
    }

    const styleTags = session.stepData.styleTags || [];
    this.setData({
      ideasText: session.stepData.ideasText || '',
      constraintsText: session.stepData.constraintsText || '',
      styleTags,
      styleOptions: buildStyleOptions(styleTags)
    });
  },

  onUnload() {
    this.flushSave();
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
  },

  handleIdeasInput(e) {
    this.setData({ ideasText: e.detail.value });
    this.scheduleSave();
  },

  handleConstraintsInput(e) {
    this.setData({ constraintsText: e.detail.value });
    this.scheduleSave();
  },

  toggleStyle(e) {
    const { value } = e.currentTarget.dataset;
    const styleTags = [...this.data.styleTags];
    const index = styleTags.indexOf(value);

    if (index >= 0) {
      styleTags.splice(index, 1);
    } else {
      styleTags.push(value);
    }

    this.setData({
      styleTags,
      styleOptions: buildStyleOptions(styleTags)
    });
    this.scheduleSave();
  },

  scheduleSave() {
    this.setData({ saveStatus: '正在保存...' });
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.flushSave();
    }, 2000);
  },

  flushSave() {
    updateStepData({
      ideasText: this.data.ideasText,
      constraintsText: this.data.constraintsText,
      styleTags: this.data.styleTags
    });
    this.setData({ saveStatus: '已自动保存' });
  },

  goNext() {
    this.flushSave();
    wx.navigateTo({ url: '/pages/copywriter/profile/profile' });
  },

  goBack() {
    wx.navigateBack();
  }
});
