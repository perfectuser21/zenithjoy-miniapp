const {
  FRONTSTAGE_TABS,
  getTabIndexByRoute
} = require('../utils/frontstage-routes')

const TAB_ICON_MAP = {
  '/pages/index/index': {
    iconPath: '/images/tab-home.png',
    selectedIconPath: '/images/tab-home-active.png'
  },
  '/pages/ai-features/index': {
    iconPath: '/images/tab-create.png',
    selectedIconPath: '/images/tab-create-active.png'
  },
  '/pages/assistant/index': {
    iconPath: '/images/tab-ai.png',
    selectedIconPath: '/images/tab-ai-active.png'
  },
  '/pages/user/user': {
    iconPath: '/images/tab-user.png',
    selectedIconPath: '/images/tab-user-active.png'
  }
}

Component({
  data: {
    selected: 0,
    color: '#8E90A6',
    selectedColor: '#FFFFFF',
    list: FRONTSTAGE_TABS.map((item) => ({
      ...item,
      ...TAB_ICON_MAP[item.pagePath]
    }))
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
      const selected = getTabIndexByRoute(currentRoute);
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
