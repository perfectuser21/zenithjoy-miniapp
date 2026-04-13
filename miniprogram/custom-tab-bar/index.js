Component({
  data: {
    selected: 0,
    color: '#8E90A6',
    selectedColor: '#FFFFFF',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/images/tab-home.png',
        selectedIconPath: '/images/tab-home-active.png'
      },
      {
        pagePath: '/pages/ai-features/index',
        text: '创作',
        iconPath: '/images/tab-create.png',
        selectedIconPath: '/images/tab-create-active.png'
      },
      {
        pagePath: '/pages/assistant/index',
        text: 'AI助理',
        iconPath: '/images/tab-ai.png',
        selectedIconPath: '/images/tab-ai-active.png'
      },
      {
        pagePath: '/pages/user/user',
        text: '我的',
        iconPath: '/images/tab-user.png',
        selectedIconPath: '/images/tab-user-active.png'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      if (!path) return;
      if (index === this.data.selected) return;
      wx.switchTab({ url: path });
    },

    updateSelected() {
      const pages = getCurrentPages();
      if (!pages.length) return;
      const currentRoute = `/${pages[pages.length - 1].route}`;
      const selected = this.data.list.findIndex((item) => item.pagePath === currentRoute);
      if (selected >= 0 && selected !== this.data.selected) {
        this.setData({ selected });
      }
    }
  },

  lifetimes: {
    attached() {
      this.updateSelected();
    }
  },

  pageLifetimes: {
    show() {
      this.updateSelected();
    }
  }
});
