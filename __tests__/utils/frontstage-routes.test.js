const {
  FRONTSTAGE_TABS,
  RETIRED_FRONTSTAGE_PAGES,
  getTabIndexByRoute
} = require('../../miniprogram/utils/frontstage-routes')

test('exports the four Pencil tabs in order', () => {
  expect(FRONTSTAGE_TABS.map((item) => item.pagePath)).toEqual([
    '/pages/index/index',
    '/pages/ai-features/index',
    '/pages/assistant/index',
    '/pages/user/user'
  ])
})

test('marks retired public pages as retired', () => {
  expect(RETIRED_FRONTSTAGE_PAGES).toEqual([
    '/pages/article-list/article-list',
    '/pages/article-detail/article-detail',
    '/pages/article/preview'
  ])
})

test('resolves tab index from route', () => {
  expect(getTabIndexByRoute('/pages/assistant/index')).toBe(2)
  expect(getTabIndexByRoute('/pages/article-list/article-list')).toBe(-1)
})
