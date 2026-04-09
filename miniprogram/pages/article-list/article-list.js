// pages/article-list/article-list.js
Page({

  data: {
    articles: [],
    isLoading: true,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad(options) {
    this.loadArticles();
  },

  onPullDownRefresh() {
    this.setData({
      articles: [],
      page: 1,
      hasMore: true,
      isLoading: true
    });
    this.loadArticles().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.isLoading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadArticles(true);
  },

  onShareAppMessage() {},

  // 加载文章列表（支持分页追加）
  loadArticles(append = false) {
    this.setData({ isLoading: true });

    return wx.cloud.callFunction({
      name: 'getRecommendArticles',
      data: {
        page: this.data.page,
        limit: this.data.pageSize
      }
    }).then(res => {
      if (res.result && res.result.success && res.result.data) {
        const newItems = res.result.data;
        const merged = append
          ? this.data.articles.concat(newItems)
          : newItems;
        this.setData({
          articles: merged,
          hasMore: newItems.length >= this.data.pageSize,
          isLoading: false
        });
      } else {
        this.setData({
          hasMore: false,
          isLoading: false
        });
      }
    }).catch(err => {
      console.error('获取文章列表失败', err);
      this.setData({ isLoading: false });
      wx.showToast({
        title: '获取文章失败，请稍后再试',
        icon: 'none',
        duration: 2000
      });
    });
  },

  // 跳转到文章详情
  goToDetail(e) {
    const url = e.currentTarget.dataset.url;
    const id = e.currentTarget.dataset.id;

    if (url) {
      wx.navigateTo({
        url: `/pages/web-view/web-view?url=${encodeURIComponent(url)}`
      });
    } else if (id) {
      wx.navigateTo({
        url: `/pages/article-detail/article-detail?id=${id}`
      });
    }
  }
})
