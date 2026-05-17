const {
  FRONTSTAGE_TABS,
  getTabIndexByRoute
} = require('../utils/frontstage-routes')

Component({
  data: {
    selected: 0,
    hidden: false,
    color: '#8E90A6',
    selectedColor: '#FFFFFF',
    list: FRONTSTAGE_TABS
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      if (!path) return;
      if (index === this.data.selected) return;
      wx.switchTab({ url: path });
    },

    updateSelected(routeOverride) {
      let currentRoute = routeOverride;
      if (!currentRoute) {
        const pages = getCurrentPages();
        if (!pages.length) return;
        currentRoute = `/${pages[pages.length - 1].route}`;
      }
      if (currentRoute.charAt(0) !== '/') {
        currentRoute = `/${currentRoute}`;
      }
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
