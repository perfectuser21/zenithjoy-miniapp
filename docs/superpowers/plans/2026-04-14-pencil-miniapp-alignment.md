# Pencil Miniapp Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the ZenithJoy miniapp frontstage so every live user-facing page, route, and interaction matches `designs/pencil-ui.pen`, while retiring old frontstage pages that are no longer in the design.

**Architecture:** Treat `designs/pencil-ui.pen` as the only frontstage source of truth. Centralize frontstage route metadata, update app-level routing and tab state first, then rebuild each page family around shared Pencil-style WXSS primitives instead of preserving legacy DOM structures. Keep data and session utilities where they already live, but realign their route outputs and flow assumptions to the new page map.

**Tech Stack:** WeChat Mini Program (`Page`, `Component`, `wx.*`), WXML, WXSS, CJS page modules, Jest 29 with `__tests__/setup/wx-mock.js`

---

## File Structure Map

- Modify: `miniprogram/app.json`
  Frontstage page registry; remove retired public pages and keep only live design-backed frontstage routes plus allowed internal/admin routes.
- Create: `miniprogram/utils/frontstage-routes.js`
  Single source for tab definitions, frontstage page ids, retired route ids, and route helper functions used by page JS and tests.
- Modify: `miniprogram/custom-tab-bar/index.js`
  Consume shared tab metadata and compute selected state from the centralized route map.
- Modify: `miniprogram/custom-tab-bar/index.wxml`
  Render the final Pencil tab labels and structure.
- Modify: `miniprogram/custom-tab-bar/index.wxss`
  Match the final Pencil pill tab bar visuals.
- Create: `miniprogram/styles/pencil-theme.wxss`
  Shared frontstage primitives: page backgrounds, cards, chips, headings, CTA buttons, safe-bottom spacing, helper utility classes.
- Modify: `miniprogram/pages/index/index.*`
- Modify: `miniprogram/pages/ai-features/index.*`
- Modify: `miniprogram/pages/assistant/index.*`
- Modify: `miniprogram/pages/user/user.*`
- Modify: `miniprogram/pages/copywriter/common.wxss`
- Modify: `miniprogram/utils/copywriter-session.js`
- Modify: `miniprogram/pages/copywriter/start/*`
- Modify: `miniprogram/pages/copywriter/keywords/*`
- Modify: `miniprogram/pages/copywriter/ideas/*`
- Modify: `miniprogram/pages/copywriter/profile/*`
- Modify: `miniprogram/pages/copywriter/topics/*`
- Modify: `miniprogram/pages/copywriter/articles/*`
- Modify: `miniprogram/pages/copywriter/article-detail/*`
- Modify: `miniprogram/pages/copywriter/title-generate/*`
- Modify: `miniprogram/pages/copywriter/title-library/*`
- Modify: `miniprogram/pages/copywriter/moments-generate/*`
- Modify: `miniprogram/pages/copywriter/moments-editor/*`
- Modify: `miniprogram/pages/ranking/detail/*`
- Modify: `miniprogram/pages/reading-list/detail/*`
- Modify: `miniprogram/utils/creator-studio.js`
- Modify: `__tests__/setup/wx-mock.js`
- Create: `__tests__/app-config.test.js`
- Create: `__tests__/utils/frontstage-routes.test.js`
- Create: `__tests__/utils/copywriter-session.test.js`
- Create: `__tests__/pages/index-routing.test.js`
- Create: `__tests__/pages/ai-features-routing.test.js`
- Create: `__tests__/pages/assistant-page.test.js`
- Create: `__tests__/pages/user-page.test.js`
- Delete: `miniprogram/pages/article-list/*`
- Delete: `miniprogram/pages/article-detail/*`
- Delete: `miniprogram/pages/article/preview.*`
- Delete: `__tests__/pages/article-list.test.js`
- Delete: `__tests__/pages/article-detail.test.js`

### Task 1: Centralize Frontstage Route Ownership

**Files:**
- Create: `miniprogram/utils/frontstage-routes.js`
- Modify: `miniprogram/app.json`
- Modify: `miniprogram/custom-tab-bar/index.js`
- Modify: `miniprogram/custom-tab-bar/index.wxml`
- Test: `__tests__/app-config.test.js`
- Test: `__tests__/utils/frontstage-routes.test.js`

- [ ] **Step 1: Write the failing route manifest tests**

```js
const { FRONTSTAGE_TABS, RETIRED_FRONTSTAGE_PAGES, getTabIndexByRoute } = require('../../miniprogram/utils/frontstage-routes')

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
```

- [ ] **Step 2: Run tests to verify it fails**

Run: `npm test -- --runTestsByPath __tests__/utils/frontstage-routes.test.js __tests__/app-config.test.js`
Expected: FAIL with missing route manifest and missing app config assertions.

- [ ] **Step 3: Write the route manifest and app config cleanup**

```js
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

module.exports = { FRONTSTAGE_TABS, RETIRED_FRONTSTAGE_PAGES, getTabIndexByRoute }
```

```json
{
  "pages": [
    "pages/index/index",
    "pages/ranking/detail/detail",
    "pages/reading-list/detail/detail",
    "pages/copywriter/start/start",
    "pages/copywriter/keywords/keywords",
    "pages/copywriter/ideas/ideas",
    "pages/copywriter/profile/profile",
    "pages/copywriter/topics/topics",
    "pages/copywriter/articles/articles",
    "pages/copywriter/article-detail/article-detail",
    "pages/copywriter/title-generate/title-generate",
    "pages/copywriter/title-library/title-library",
    "pages/copywriter/moments-generate/moments-generate",
    "pages/copywriter/moments-editor/moments-editor",
    "pages/ai-features/index",
    "pages/assistant/index",
    "pages/user/user",
    "pages/ai-chat/ai-chat",
    "pages/membership/membership",
    "pages/web-view/web-view",
    "pages/chatHistory/index",
    "pages/admin/article/index",
    "pages/admin/article/add",
    "pages/admin/article/edit"
  ]
}
```

- [ ] **Step 4: Run tests to verify it passes**

Run: `npm test -- --runTestsByPath __tests__/utils/frontstage-routes.test.js __tests__/app-config.test.js`
Expected: PASS with route manifest and app config assertions green.

- [ ] **Step 5: Commit**

```bash
git add miniprogram/utils/frontstage-routes.js miniprogram/app.json miniprogram/custom-tab-bar/index.js miniprogram/custom-tab-bar/index.wxml miniprogram/custom-tab-bar/index.wxss __tests__/app-config.test.js __tests__/utils/frontstage-routes.test.js
git commit -m "refactor: centralize frontstage route ownership"
```

### Task 2: Build Shared Pencil Theme Primitives

**Files:**
- Create: `miniprogram/styles/pencil-theme.wxss`
- Modify: `miniprogram/custom-tab-bar/index.wxss`
- Modify: `miniprogram/pages/index/index.wxss`
- Modify: `miniprogram/pages/ai-features/index.wxss`
- Modify: `miniprogram/pages/assistant/index.wxss`
- Modify: `miniprogram/pages/user/user.wxss`
- Modify: `miniprogram/pages/copywriter/common.wxss`

- [ ] **Step 1: Write a failing smoke test for the shared theme**

```js
const fs = require('fs')
const path = require('path')

test('shared Pencil theme exists for frontstage pages', () => {
  expect(fs.existsSync(path.join(process.cwd(), 'miniprogram/styles/pencil-theme.wxss'))).toBe(true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath __tests__/app-config.test.js`
Expected: FAIL with missing shared theme file.

- [ ] **Step 3: Write the shared theme file and import it from all live frontstage page WXSS files**

```css
.p-page { min-height: 100vh; background: linear-gradient(180deg, #f7f9ff 0%, #eef3ff 100%); color: #0f172a; }
.p-shell { padding-left: 40rpx; padding-right: 40rpx; padding-bottom: calc(140rpx + env(safe-area-inset-bottom)); box-sizing: border-box; }
.p-card { border-radius: 36rpx; background: rgba(255,255,255,0.92); border: 2rpx solid #e3eaf5; box-shadow: 0 18rpx 48rpx rgba(31,41,55,0.08); }
.p-primary-btn { border-radius: 999rpx; background: linear-gradient(135deg, #1847d8 0%, #4263eb 58%, #16a3b7 100%); color: #fff; font-size: 28rpx; font-weight: 700; }
```

```css
@import "/styles/pencil-theme.wxss";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath __tests__/app-config.test.js`
Expected: PASS and no missing shared theme assertion.

- [ ] **Step 5: Commit**

```bash
git add miniprogram/styles/pencil-theme.wxss miniprogram/custom-tab-bar/index.wxss miniprogram/pages/index/index.wxss miniprogram/pages/ai-features/index.wxss miniprogram/pages/assistant/index.wxss miniprogram/pages/user/user.wxss miniprogram/pages/copywriter/common.wxss __tests__/app-config.test.js
git commit -m "style: add shared Pencil frontstage theme"
```

### Task 3: Rebuild the Four Tab Root Pages

**Files:**
- Modify: `miniprogram/pages/index/index.*`
- Modify: `miniprogram/pages/ai-features/index.*`
- Modify: `miniprogram/pages/assistant/index.*`
- Modify: `miniprogram/pages/user/user.*`
- Test: `__tests__/pages/index-routing.test.js`
- Test: `__tests__/pages/ai-features-routing.test.js`
- Test: `__tests__/pages/assistant-page.test.js`
- Test: `__tests__/pages/user-page.test.js`

- [ ] **Step 1: Write failing route-action tests for the tab root pages**

```js
describe('index page routing', () => {
  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    require('../../miniprogram/pages/index/index.js')
  })

  test('opens copywriter start', () => {
    const page = global.__getLastPage()
    page.openCopywriterStart()
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/copywriter/start/start' })
  })
})
```

```js
describe('workflow page routing', () => {
  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    require('../../miniprogram/pages/ai-features/index.js')
  })

  test('opens title studio', () => {
    const page = global.__getLastPage()
    page.openTitleStudio()
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/copywriter/title-generate/title-generate' })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --runTestsByPath __tests__/pages/index-routing.test.js __tests__/pages/ai-features-routing.test.js __tests__/pages/assistant-page.test.js __tests__/pages/user-page.test.js`
Expected: FAIL because the final explicit action methods do not exist yet.

- [ ] **Step 3: Rebuild the root page structures and explicit route handlers**

```js
openCopywriterStart() { wx.navigateTo({ url: '/pages/copywriter/start/start' }) }
openTitleStudio() { wx.navigateTo({ url: '/pages/copywriter/title-generate/title-generate' }) }
openMomentsStudio() { wx.navigateTo({ url: '/pages/copywriter/moments-generate/moments-generate' }) }
openRankingDetail() { wx.navigateTo({ url: '/pages/ranking/detail/detail' }) }
openReadingDetail() { wx.navigateTo({ url: '/pages/reading-list/detail/detail' }) }
```

```xml
<view class="p-page">
  <view class="p-shell" style="padding-top: {{statusBarHeight + 16}}px;">
    <view class="p-card"></view>
    <view class="p-card"></view>
  </view>
</view>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --runTestsByPath __tests__/pages/index-routing.test.js __tests__/pages/ai-features-routing.test.js __tests__/pages/assistant-page.test.js __tests__/pages/user-page.test.js`
Expected: PASS, confirming the tab roots only route into supported live pages.

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/index/index.js miniprogram/pages/index/index.wxml miniprogram/pages/index/index.wxss miniprogram/pages/ai-features/index.js miniprogram/pages/ai-features/index.wxml miniprogram/pages/ai-features/index.wxss miniprogram/pages/assistant/index.js miniprogram/pages/assistant/index.wxml miniprogram/pages/assistant/index.wxss miniprogram/pages/user/user.js miniprogram/pages/user/user.wxml miniprogram/pages/user/user.wxss __tests__/pages/index-routing.test.js __tests__/pages/ai-features-routing.test.js __tests__/pages/assistant-page.test.js __tests__/pages/user-page.test.js
git commit -m "feat: align Pencil tab root pages"
```

### Task 4: Realign the Copywriter Flow and Session Routing

**Files:**
- Modify: `miniprogram/utils/copywriter-session.js`
- Modify: `miniprogram/pages/copywriter/start/*`
- Modify: `miniprogram/pages/copywriter/keywords/*`
- Modify: `miniprogram/pages/copywriter/ideas/*`
- Modify: `miniprogram/pages/copywriter/profile/*`
- Modify: `miniprogram/pages/copywriter/topics/*`
- Modify: `miniprogram/pages/copywriter/articles/*`
- Modify: `miniprogram/pages/copywriter/article-detail/*`
- Test: `__tests__/utils/copywriter-session.test.js`

- [ ] **Step 1: Write failing session-route tests**

```js
const { createSession, updateStepData, setTopics, setArticles, getResumeRoute, clearSession } = require('../../miniprogram/utils/copywriter-session')

afterEach(() => clearSession())

test('resumes to keywords after keywords are entered', () => {
  createSession()
  updateStepData({ keywordsText: 'AI, 短视频' })
  expect(getResumeRoute()).toBe('/pages/copywriter/keywords/keywords')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --runTestsByPath __tests__/utils/copywriter-session.test.js`
Expected: FAIL because the current route outputs do not fully match the Pencil flow.

- [ ] **Step 3: Update the session map and page navigation rules**

```js
function getResumeRoute() {
  const session = loadSession()
  if (!session) return '/pages/copywriter/start/start'
  if (session.currentArticleId && session.currentTopicId) return `/pages/copywriter/article-detail/article-detail?topicId=${session.currentTopicId}&articleId=${session.currentArticleId}`
  if (session.currentTopicId) return `/pages/copywriter/articles/articles?topicId=${session.currentTopicId}`
  if (session.currentStep >= 4) return '/pages/copywriter/topics/topics'
  if (session.currentStep >= 3) return '/pages/copywriter/profile/profile'
  if (session.currentStep >= 2) return '/pages/copywriter/ideas/ideas'
  if (session.currentStep >= 1) return '/pages/copywriter/keywords/keywords'
  return '/pages/copywriter/start/start'
}
```

```js
openArticles(e) { wx.redirectTo({ url: `/pages/copywriter/articles/articles?topicId=${e.currentTarget.dataset.id}` }) }
goBack() { wx.redirectTo({ url: '/pages/copywriter/topics/topics' }) }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --runTestsByPath __tests__/utils/copywriter-session.test.js`
Expected: PASS, confirming the flow resume route matches the Pencil sequence.

- [ ] **Step 5: Commit**

```bash
git add miniprogram/utils/copywriter-session.js miniprogram/pages/copywriter/start miniprogram/pages/copywriter/keywords miniprogram/pages/copywriter/ideas miniprogram/pages/copywriter/profile miniprogram/pages/copywriter/topics miniprogram/pages/copywriter/articles miniprogram/pages/copywriter/article-detail __tests__/utils/copywriter-session.test.js
git commit -m "feat: align Pencil copywriter flow"
```

### Task 5: Align Secondary Frontstage Pages and Remove Retired Public Pages

**Files:**
- Modify: `miniprogram/utils/creator-studio.js`
- Modify: `miniprogram/pages/copywriter/title-generate/*`
- Modify: `miniprogram/pages/copywriter/title-library/*`
- Modify: `miniprogram/pages/copywriter/moments-generate/*`
- Modify: `miniprogram/pages/copywriter/moments-editor/*`
- Modify: `miniprogram/pages/ranking/detail/*`
- Modify: `miniprogram/pages/reading-list/detail/*`
- Delete: `miniprogram/pages/article-list/*`
- Delete: `miniprogram/pages/article-detail/*`
- Delete: `miniprogram/pages/article/preview.*`
- Delete: `__tests__/pages/article-list.test.js`
- Delete: `__tests__/pages/article-detail.test.js`

- [ ] **Step 1: Write the failing config and routing assertions**

```js
const appConfig = require('../../miniprogram/app.json')

test('retired public pages are removed from app.json', () => {
  expect(appConfig.pages).not.toContain('pages/article-list/article-list')
  expect(appConfig.pages).not.toContain('pages/article-detail/article-detail')
  expect(appConfig.pages).not.toContain('pages/article/preview')
})
```

```js
test('workflow page opens moments generate instead of preview', () => {
  const page = global.__getLastPage()
  page.openMomentsStudio()
  expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/copywriter/moments-generate/moments-generate' })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --runTestsByPath __tests__/app-config.test.js __tests__/pages/ai-features-routing.test.js`
Expected: FAIL until retired routes are removed and secondary pages point only at live design-backed pages.

- [ ] **Step 3: Rebuild the secondary pages and delete retired public pages**

```js
openRefinePage() { wx.navigateTo({ url: '/pages/copywriter/moments-editor/moments-editor' }) }
backToStudio() { wx.switchTab({ url: '/pages/ai-features/index' }) }
openReadingDetail() { wx.navigateTo({ url: '/pages/reading-list/detail/detail' }) }
```

```bash
rm miniprogram/pages/article-list/article-list.js miniprogram/pages/article-list/article-list.json miniprogram/pages/article-list/article-list.wxml miniprogram/pages/article-list/article-list.wxss
rm miniprogram/pages/article-detail/article-detail.js miniprogram/pages/article-detail/article-detail.json miniprogram/pages/article-detail/article-detail.wxml miniprogram/pages/article-detail/article-detail.wxss
rm miniprogram/pages/article/preview.js miniprogram/pages/article/preview.json miniprogram/pages/article/preview.wxml miniprogram/pages/article/preview.wxss
rm __tests__/pages/article-list.test.js __tests__/pages/article-detail.test.js
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --runTestsByPath __tests__/app-config.test.js __tests__/pages/index-routing.test.js __tests__/pages/ai-features-routing.test.js __tests__/pages/assistant-page.test.js __tests__/pages/user-page.test.js __tests__/utils/copywriter-session.test.js`
Expected: PASS, proving retired pages are gone and the live frontstage routes still work.

- [ ] **Step 5: Commit**

```bash
git add miniprogram/utils/creator-studio.js miniprogram/pages/copywriter/title-generate miniprogram/pages/copywriter/title-library miniprogram/pages/copywriter/moments-generate miniprogram/pages/copywriter/moments-editor miniprogram/pages/ranking/detail miniprogram/pages/reading-list/detail __tests__/app-config.test.js
git add -u miniprogram/pages/article-list miniprogram/pages/article-detail miniprogram/pages/article __tests__/pages/article-list.test.js __tests__/pages/article-detail.test.js
git commit -m "refactor: remove retired public pages and align secondary flows"
```

### Task 6: Final Verification and Preview Readiness

**Files:**
- Modify: `docs/launch-checklist.md`

- [ ] **Step 1: Update the launch checklist with Pencil alignment checks**

```md
## Pencil 对齐回归

- [ ] 4 个 Tab 页面与 `designs/pencil-ui.pen` 对齐
- [ ] Copywriter 六步流程与返回链路通过
- [ ] 标题、朋友圈、榜单、创作集详情入口通过
- [ ] 已下线页面不再出现在前台入口或 `app.json`
```

- [ ] **Step 2: Run the full automated test suite**

Run: `npm test -- --testPathPattern=__tests__`
Expected: PASS across route manifest, tab roots, copywriter session, and remaining page tests.

- [ ] **Step 3: Run a manual route grep before preview**

Run: `rg -n "article-list|article-detail|article/preview" miniprogram`
Expected: only admin-only or historical references remain; no frontstage runtime references.

- [ ] **Step 4: Run preview smoke checks**

Run: `npm run preview`
Expected: preview upload completes and generates the latest QR code image without route registration errors.

- [ ] **Step 5: Commit**

```bash
git add docs/launch-checklist.md
git commit -m "docs: add Pencil alignment verification checklist"
```
