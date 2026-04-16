const {
  getFinalTitle,
  getTitleLibrary,
  removeTitleLibraryItem,
  toggleTitleLibraryStatus
} = require('../../../utils/creator-studio');

function mapStatus(status) {
  if (status === 'locked') {
    return { label: '已锁定', className: 'status-locked', actionText: '取消锁定' };
  }
  if (status === 'compare') {
    return { label: '待比较', className: 'status-compare', actionText: '锁定' };
  }

  return { label: '备选中', className: 'status-saved', actionText: '锁定' };
}

function formatItems(items) {
  return (items || []).map((item) => ({
    ...item,
    ...mapStatus(item.status)
  }));
}

function buildStats(items) {
  return {
    all: items.length,
    locked: items.filter((item) => item.status === 'locked').length,
    compare: items.filter((item) => item.status === 'compare').length
  };
}

Page({
  data: {
    heroCard: {
      kicker: '标题备选库',
      title: '把想保留的标题先收进这里，再集中比较和确认',
      description: '支持按状态查看、锁定优先标题、删除不需要的版本。'
    },
    items: [],
    stats: {
      all: 0,
      locked: 0,
      compare: 0
    },
    finalTitle: null
  },

  onShow() {
    this.refreshPage();
  },

  refreshPage() {
    const items = formatItems(getTitleLibrary());
    const finalTitle = getFinalTitle();
    this.setData({
      items,
      stats: buildStats(items),
      finalTitle
    });
  },

  toggleStatus(e) {
    toggleTitleLibraryStatus(e.currentTarget.dataset.id);
    this.refreshPage();
  },

  removeItem(e) {
    removeTitleLibraryItem(e.currentTarget.dataset.id);
    this.refreshPage();
  },

  copyFinalTitle() {
    const finalTitle = this.data.finalTitle;
    if (!finalTitle) {
      return;
    }

    wx.setClipboardData({
      data: finalTitle.text,
      success: () => {
        wx.showToast({ title: '标题已复制', icon: 'none' });
      }
    });
  },

  continueAdd() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
      return;
    }

    wx.redirectTo({ url: '/pages/copywriter/title-generate/title-generate' });
  },

  backToStudio() {
    wx.switchTab({ url: '/pages/ai-features/index' });
  }
});
