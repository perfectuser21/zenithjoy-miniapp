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

Page({
  data: {
    items: [],
    finalTitle: null
  },

  onShow() {
    this.refreshPage();
  },

  refreshPage() {
    const items = formatItems(getTitleLibrary());
    const finalTitle = getFinalTitle();
    this.setData({ items, finalTitle });
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
    wx.navigateBack({ delta: 1 });
  },

  backToStudio() {
    wx.switchTab({ url: '/pages/ai-features/index' });
  }
});
