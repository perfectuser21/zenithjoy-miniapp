function buildDefaultArticle(id = 'reading-preview') {
  return {
    id,
    title: 'Dan Koe：一人公司内容路径',
    eyebrow: 'FULL ARTICLE',
    heroDesc: '把这篇文章直接展开成完整阅读页，方便你一次看完核心观点、结构逻辑和可模仿的表达方式。',
    heroMetaChips: ['08 min 阅读', '完整文章'],
    summaryTitle: '文章信息',
    summaryMeta: '完整阅读',
    summaryTag: 'Dan Koe / 一人公司',
    summaryDesc:
      '这篇文章的核心不是讲工具，而是讲一个人如何把内容、产品和表达方式串成同一条增长路径。先理解框架，再回到自己的主题里模仿，会比直接抄形式更有效。',
    bodyTitle: '文章正文',
    bodyMeta: '完整显示',
    bodyBlocks: [
      {
        type: 'p',
        content:
          'Dan Koe 认为，一个人的内容系统不该只是为了发作品，而应该成为个人商业路径的一部分。内容负责吸引注意力，产品负责承接需求，表达方式则决定你能否持续被记住。'
      },
      { type: 'h', content: '01 先确定你要解决什么问题' },
      {
        type: 'p',
        content:
          '他强调，不要先问平台喜欢什么，而要先问你到底在替谁解决什么问题。只有问题足够明确，后面的内容、案例和产品才会自然长出来。否则你会一直追热点，却很难沉淀成自己的结构。'
      },
      { type: 'h', content: '02 再把观点写成可重复的表达模板' },
      {
        type: 'p',
        content:
          '一篇内容真正有价值的地方，不是某个金句，而是它背后的表达顺序。Dan Koe 常用的方式是：先抛出问题，再建立认知差，再给出方法路径，最后落到行动建议。这个结构很适合被拆成你的日更模板。'
      },
      { type: 'h', content: '03 内容最终要回到产品和长期资产' },
      {
        type: 'p',
        content:
          '文章最后提醒，内容本身不该只是流量行为。你写下来的观点、案例和方法，最好能不断回流到自己的知识库、产品或服务里。这样内容不是一次性曝光，而是会逐渐形成你自己的复利资产。'
      }
    ]
  };
}

Page({
  data: {
    statusBarHeight: 20,
    article: null,
    isLoading: true,
    error: null
  },

  onLoad(options) {
    const { id, url } = options || {};

    wx.updateShareMenu({
      withShareTicket: false,
      isUpdatableMessage: false,
      success() {
        console.log('[share] updateShareMenu ok');
      }
    });

    if (typeof wx.getSystemInfoSync === 'function') {
      try {
        const systemInfo = wx.getSystemInfoSync();
        this.setData({ statusBarHeight: systemInfo.statusBarHeight || 20 });
      } catch (err) {
        console.error('获取系统信息失败', err);
      }
    }

    if (url) {
      wx.redirectTo({
        url: `/pages/web-view/web-view?url=${encodeURIComponent(url)}`
      });
      return;
    }

    if (id) {
      this.getArticleDetail(id);
      return;
    }

    this.setMockArticle('reading-preview');
  },

  onReady() {
    wx.setNavigationBarTitle({ title: '单篇文章阅读' });
  },

  onPullDownRefresh() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options || {};

    if (options.id) {
      this.setData({
        isLoading: true,
        error: null,
        article: null
      });
      this.getArticleDetail(options.id);
    } else {
      this.setMockArticle('reading-preview');
    }

    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    const article = this.data.article || buildDefaultArticle();
    return {
      title: article.title || 'ZenithJoy 精选内容',
      path: '/pages/article-detail/article-detail',
      imageUrl: '/images/default-cover.png'
    };
  },

  onShareTimeline() {
    const article = this.data.article || buildDefaultArticle();
    return {
      title: article.title || 'ZenithJoy 精选内容',
      imageUrl: '/images/default-cover.png'
    };
  },

  goBack() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  getArticleDetail(id) {
    wx.cloud.callFunction({
      name: 'getArticleDetail',
      data: { id },
      success: (res) => {
        const data = res?.result?.data;
        if (!data) {
          this.setMockArticle(id);
          return;
        }
        this.setData({
          article: {
            ...buildDefaultArticle(id),
            title: data.title || 'Dan Koe：一人公司内容路径',
            summaryDesc:
              data.desc ||
              '这篇文章的核心不是讲工具，而是讲一个人如何把内容、产品和表达方式串成同一条增长路径。',
            bodyBlocks: buildDefaultArticle(id).bodyBlocks
          },
          isLoading: false,
          error: null
        });
        wx.setNavigationBarTitle({
          title: data.title || '单篇文章阅读'
        });
      },
      fail: (err) => {
        console.error('获取文章详情失败', err);
        this.setMockArticle(id);
      }
    });
  },

  setMockArticle(id) {
    const mockArticle = buildDefaultArticle(id);
    this.setData({
      article: mockArticle,
      isLoading: false,
      error: null
    });
    wx.setNavigationBarTitle({
      title: mockArticle.title
    });
  }
});
