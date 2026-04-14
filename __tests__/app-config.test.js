const appConfig = require('../miniprogram/app.json')
const {
  FRONTSTAGE_TABS,
  RETIRED_FRONTSTAGE_PAGES
} = require('../miniprogram/utils/frontstage-routes')
const fs = require('fs')
const path = require('path')

const THEME_PATH = path.join(process.cwd(), 'miniprogram/styles/pencil-theme.wxss')
const FRONTSTAGE_WXSS_FILES = [
  'miniprogram/custom-tab-bar/index.wxss',
  'miniprogram/pages/index/index.wxss',
  'miniprogram/pages/ai-features/index.wxss',
  'miniprogram/pages/assistant/index.wxss',
  'miniprogram/pages/user/user.wxss',
  'miniprogram/pages/copywriter/common.wxss'
]
const REQUIRED_SELECTOR_GROUPS = [
  '.page, .p-page {',
  '.page-shell, .p-shell {',
  '.panel, .p-card {',
  '.primary-cta, .p-primary-btn {'
]

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

test('shared Pencil theme exists for frontstage pages', () => {
  expect(fs.existsSync(THEME_PATH)).toBe(true)
})

test('frontstage WXSS files import the shared Pencil theme', () => {
  FRONTSTAGE_WXSS_FILES.forEach((relativePath) => {
    const content = fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
    expect(content).toContain('@import "/styles/pencil-theme.wxss";')
  })
})

test('shared Pencil theme exports aliased selectors', () => {
  const content = fs.readFileSync(THEME_PATH, 'utf8')
  REQUIRED_SELECTOR_GROUPS.forEach((selectorGroup) => {
    expect(content).toContain(selectorGroup)
  })
})
