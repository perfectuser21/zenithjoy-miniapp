const FRONTSTAGE_TABS = [
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

const RETIRED_FRONTSTAGE_PAGES = [
  '/pages/article-list/article-list',
  '/pages/article-detail/article-detail',
  '/pages/article/preview'
]

function getTabIndexByRoute(route) {
  return FRONTSTAGE_TABS.findIndex((item) => item.pagePath === route)
}

module.exports = {
  FRONTSTAGE_TABS,
  RETIRED_FRONTSTAGE_PAGES,
  getTabIndexByRoute
}
