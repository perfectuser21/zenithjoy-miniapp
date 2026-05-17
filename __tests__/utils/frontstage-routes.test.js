const {
  FRONTSTAGE_TABS,
  RETIRED_FRONTSTAGE_PAGES,
  getTabIndexByRoute
} = require('../../miniprogram/utils/frontstage-routes')

test('exports the four Pencil tabs in order', () => {
  expect(FRONTSTAGE_TABS).toEqual([
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
  ])
})

test('marks retired public pages as retired', () => {
  expect(RETIRED_FRONTSTAGE_PAGES).toEqual([
    '/pages/article-list/article-list',
    '/pages/article/preview'
  ])
})

test('resolves tab index from route', () => {
  expect(getTabIndexByRoute('/pages/assistant/index')).toBe(2)
  expect(getTabIndexByRoute('/pages/article-list/article-list')).toBe(-1)
})

test('custom tab bar consumes the frontstage manifest directly', () => {
  let customTabBarConfig
  const originalComponent = global.Component

  global.Component = function (config) {
    customTabBarConfig = config
    return config
  }

  jest.isolateModules(() => {
    require('../../miniprogram/custom-tab-bar/index')
  })

  global.Component = originalComponent

  expect(customTabBarConfig.data.list).toEqual(FRONTSTAGE_TABS)
})

test('custom tab bar resolves workflow route to the create tab', () => {
  let customTabBarConfig
  const originalComponent = global.Component

  global.Component = function (config) {
    customTabBarConfig = config
    return config
  }

  jest.isolateModules(() => {
    require('../../miniprogram/custom-tab-bar/index')
  })

  global.Component = originalComponent

  const setData = jest.fn()
  customTabBarConfig.methods.updateSelected.call({ setData, data: { selected: 0 } }, '/pages/ai-features/index')

  expect(setData).toHaveBeenCalledWith({ selected: 1 })
})
