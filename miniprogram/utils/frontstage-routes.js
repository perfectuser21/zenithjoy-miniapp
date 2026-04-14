const FRONTSTAGE_TABS = [
  { pagePath: '/pages/index/index', text: '首页' },
  { pagePath: '/pages/ai-features/index', text: '创作' },
  { pagePath: '/pages/assistant/index', text: 'AI助理' },
  { pagePath: '/pages/user/user', text: '我的' }
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
