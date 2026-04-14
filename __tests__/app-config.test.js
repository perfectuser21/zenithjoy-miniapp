const appConfig = require('../miniprogram/app.json')
const {
  FRONTSTAGE_TABS,
  RETIRED_FRONTSTAGE_PAGES
} = require('../miniprogram/utils/frontstage-routes')

test('app json pages excludes retired frontstage pages', () => {
  expect(appConfig.pages).toEqual(
    expect.not.arrayContaining(RETIRED_FRONTSTAGE_PAGES.map((path) => path.slice(1)))
  )
})

test('app json tab bar matches the frontstage tab manifest', () => {
  expect(appConfig.tabBar.list).toEqual(
    FRONTSTAGE_TABS.map(({ pagePath, text, iconPath, selectedIconPath }) => ({
      pagePath: pagePath.slice(1),
      text,
      iconPath: iconPath.slice(1),
      selectedIconPath: selectedIconPath.slice(1)
    }))
  )
})
