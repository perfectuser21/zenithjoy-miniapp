# Pencil Miniapp Full Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 `designs/pencil-ui.pen` 和页面逻辑图，将小程序 `01-17` 全部页面重写为与当前 Pencil 设计稿一致的实现，并在每个批次通过本地截图 gate 后再进入上传批次。

**Architecture:** 采用“一级页先行、二级流程后续”的批次重写方式。每页都遵守同一条同步链路：重新抓 Pencil 截图与节点、建立唯一页面映射、按 `390px -> 750rpx` 换算、先测红后实现、完成页面级和批次级验收，再决定是否上传。

**Tech Stack:** WeChat Mini Program (`WXML/WXSS/JS`), Jest, Pencil MCP, `miniprogram-ci`

---

## 批次划分

### Batch A: 一级页
- `01 Home`
- `02 Workflow`
- `03 AI 助理首页`
- `04 我的`

### Batch B: Copywriter 主流程
- `05 Start`
- `06 Keywords`
- `07 Ideas`
- `08 Profile`
- `09 Topics`
- `10 Articles`
- `11 Detail`

### Batch C: 标题与朋友圈二级流程
- `12 Title Generate`
- `13 Title Library`
- `14 Moments Generate`
- `15 Moments Editor`

### Batch D: 详情页
- `16 Ranking Detail`
- `17 Reading Detail`

---

## 统一执行规则

每个页面都必须按下列顺序执行：

1. 重新运行 `get_editor_state`
2. 重新抓该页面 `get_screenshot`
3. 重新抓该页面 `batch_get`
4. 核对 `app.json` 与实际页面文件
5. 写失败测试，锁住结构和关键节点
6. 运行测试，确认失败
7. 改 `WXML`
8. 改 `WXSS`
9. 改 `JS`
10. 运行页面测试
11. 运行批次测试
12. 更新验收文档

硬规则：
- 不能复用上一轮的截图或节点数据
- 不能直接把 Pencil `px` 抄成 `rpx`
- 不能把旧设计稿的 sibling hierarchy 留在当前代码里
- 页面未通过本地 gate，不允许进入上传批次

---

## Task 1: 重写 Batch A / `01 Home`

**Files:**
- Modify: `__tests__/pages/index-routing.test.js`
- Modify: `miniprogram/pages/index/index.js`
- Modify: `miniprogram/pages/index/index.wxml`
- Modify: `miniprogram/pages/index/index.wxss`
- Reference: `docs/superpowers/specs/2026-04-15-pencil-miniapp-release-sop.md`

- [ ] **Step 1: 重新抓取 Home 的 Pencil 证据**

Run:
```text
Pencil MCP:
- get_screenshot(nodeId="MzQ2U")
- batch_get(nodeIds=["MzQ2U"])
```

Expected:
```text
确认标题是“今天先做什么”，主体结构为 head -> insightImage -> nextCard -> createSection -> assist -> pill
```

- [ ] **Step 2: 写失败测试，锁住 Home 当前结构**

```js
test('home uses current pencil heading and section shape', () => {
  jest.resetModules();
  global.__resetPage();
  require('../../miniprogram/pages/index/index.js');
  const page = global.__getLastPage();

  expect(page.data.homeTitle).toBe('今天先做什么');
  expect(page.data.rankingItems).toHaveLength(3);
  expect(page.data.creationCards).toHaveLength(4);
  expect(page.data.collectionItems).toHaveLength(3);
});
```

- [ ] **Step 3: 运行测试，确认失败**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/index-routing.test.js --runInBand
```

Expected:
```text
FAIL
Expected: "今天先做什么"
Received: "首页"
```

- [ ] **Step 4: 最小实现 Home 数据模型**

`miniprogram/pages/index/index.js`
```js
data: {
  homeTitle: '今天先做什么',
  userEntry: {
    label: '成长会员',
    points: '连续创作 6 天'
  },
  rankingItems: [/* 3 items */],
  creationCards: [/* 4 items */],
  collectionItems: [/* 3 items */]
}
```

- [ ] **Step 5: 最小实现 Home 结构**

`miniprogram/pages/index/index.wxml`
```xml
<view class="home-page">
  <view class="home-shell" style="padding-top: {{statusBarHeight + 16}}px;">
    <view class="home-head">...</view>
    <view class="home-hero-card">...</view>
    <view class="home-section-card home-ranking-card">...</view>
    <view class="home-section-card home-creation-card">...</view>
    <view class="home-section-card home-assist-card">...</view>
    <view class="home-pill">...</view>
  </view>
</view>
```

- [ ] **Step 6: 最小实现 Home 视觉**

`miniprogram/pages/index/index.wxss`
```css
.home-title { font-size: 46rpx; }
.home-ranking-name,
.home-collection-title { font-size: 27rpx; }
.home-pill-text { font-size: 27rpx; }
```

- [ ] **Step 7: 运行测试，确认通过**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/index-routing.test.js --runInBand
```

Expected:
```text
PASS __tests__/pages/index-routing.test.js
```

---

## Task 2: 重写 Batch A / `02 Workflow`

**Files:**
- Modify: `__tests__/pages/ai-features-routing.test.js`
- Modify: `miniprogram/pages/ai-features/index.js`
- Modify: `miniprogram/pages/ai-features/index.wxml`
- Modify: `miniprogram/pages/ai-features/index.wxss`

- [ ] **Step 1: 重新抓取 Workflow 的 Pencil 证据**

Run:
```text
Pencil MCP:
- get_screenshot(nodeId="aAxba")
- batch_get(nodeIds=["aAxba"])
```

Expected:
```text
确认结构为 head -> banner -> createTools -> titleSection -> momentsSection -> pill
```

- [ ] **Step 2: 写失败测试，锁住 Workflow 当前结构**

```js
test('workflow uses current pencil sections and 4-step flow', () => {
  jest.resetModules();
  global.__resetPage();
  require('../../miniprogram/pages/ai-features/index.js');
  const page = global.__getLastPage();

  expect(page.data.pageTitle).toBe('今天创作什么');
  expect(page.data.flowSteps).toHaveLength(4);
  expect(page.data.titleChips).toHaveLength(6);
  expect(page.data.momentsChips).toHaveLength(3);
});
```

- [ ] **Step 3: 运行测试，确认失败**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/ai-features-routing.test.js --runInBand
```

Expected:
```text
FAIL
Expected: "今天创作什么"
Received: "工作流"
```

- [ ] **Step 4: 最小实现 Workflow 数据模型**

`miniprogram/pages/ai-features/index.js`
```js
data: {
  eyebrow: 'CREATE STUDIO',
  pageTitle: '今天创作什么',
  availablePoints: '可用积分 128',
  flowSteps: [/* 4 items */],
  titleChips: [/* 6 items */],
  momentsChips: [/* 3 items */]
}
```

- [ ] **Step 5: 最小实现 Workflow 结构与视觉**

`miniprogram/pages/ai-features/index.wxml`
```xml
<view class="p-page">
  <view class="p-shell" style="padding-top: {{statusBarHeight + 16}}px;">
    <view class="p-head">...</view>
    <view class="p-banner-card">...</view>
    <view class="p-card p-main-card">...</view>
    <view class="p-card p-title-card">...</view>
    <view class="p-card p-moments-card">...</view>
    <view class="p-pill-nav">...</view>
  </view>
</view>
```

`miniprogram/pages/ai-features/index.wxss`
```css
.p-page-title { font-size: 62rpx; }
.p-section-title { font-size: 35rpx; }
.p-chip-text,
.p-cta-text { font-size: 27rpx; }
```

- [ ] **Step 6: 运行测试，确认通过**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/ai-features-routing.test.js --runInBand
```

Expected:
```text
PASS __tests__/pages/ai-features-routing.test.js
```

---

## Task 3: 重写 Batch A / `03 AI 助理首页`

**Files:**
- Modify: `__tests__/pages/assistant-page.test.js`
- Modify: `miniprogram/pages/assistant/index.js`
- Modify: `miniprogram/pages/assistant/index.wxml`
- Modify: `miniprogram/pages/assistant/index.wxss`

- [ ] **Step 1: 重新抓取 AI 助理首页的 Pencil 证据**

Run:
```text
Pencil MCP:
- get_screenshot(nodeId="hfL0M")
- batch_get(nodeIds=["hfL0M"])
```

Expected:
```text
确认结构为 head -> preview panel -> quick chips -> input bar -> pill
```

- [ ] **Step 2: 写失败测试并执行红灯**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/assistant-page.test.js --runInBand
```

Expected:
```text
FAIL
```

- [ ] **Step 3: 重建 `assistant/index.{js,wxml,wxss}`**

```js
// page data includes hero, previewCards, quickChips, inputPlaceholder
```

```xml
<view class="assistant-page">...</view>
```

```css
.assistant-title { font-size: 62rpx; }
.assistant-panel-title { font-size: 31rpx; }
.assistant-chip-text,
.assistant-input-text { font-size: 27rpx; }
```

- [ ] **Step 4: 运行测试，确认通过**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/assistant-page.test.js --runInBand
```

Expected:
```text
PASS
```

---

## Task 4: 重写 Batch A / `04 我的`

**Files:**
- Modify: `__tests__/pages/user-page.test.js`
- Modify: `miniprogram/pages/user/user.js`
- Modify: `miniprogram/pages/user/user.wxml`
- Modify: `miniprogram/pages/user/user.wxss`

- [ ] **Step 1: 重新抓取 My Center 的 Pencil 证据**

Run:
```text
Pencil MCP:
- get_screenshot(nodeId="gbi0w")
- batch_get(nodeIds=["gbi0w"])
```

Expected:
```text
确认结构为 edit button -> profile card -> points card -> benefits card -> menu card -> recent activity -> pill
```

- [ ] **Step 2: 写失败测试并执行红灯**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/user-page.test.js --runInBand
```

Expected:
```text
FAIL
```

- [ ] **Step 3: 重建 `user/user.{js,wxml,wxss}`**

```js
// page data includes profile, pointsSummary, benefitCards, menuItems, recentItems
```

```xml
<view class="user-page">...</view>
```

```css
.user-title { font-size: 62rpx; }
.user-card-title { font-size: 31rpx; }
.user-meta,
.user-menu-text,
.user-pill-text { font-size: 27rpx; }
```

- [ ] **Step 4: 运行测试，确认通过**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/user-page.test.js --runInBand
```

Expected:
```text
PASS
```

---

## Task 5: 完成 Batch A 验收

**Files:**
- Modify: `docs/superpowers/specs/2026-04-15-pencil-miniapp-mapping-and-acceptance.md`
- Modify: `docs/superpowers/specs/2026-04-15-pencil-miniapp-release-sop.md`

- [ ] **Step 1: 运行一级页测试**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/index-routing.test.js __tests__/pages/ai-features-routing.test.js __tests__/pages/assistant-page.test.js __tests__/pages/user-page.test.js --runInBand
```

Expected:
```text
PASS
```

- [ ] **Step 2: 运行全量测试**

Run:
```bash
./node_modules/.bin/jest --runInBand
```

Expected:
```text
PASS
```

- [ ] **Step 3: 更新验收表**

```md
- 01 Home: Structure PASS / Typography PASS / Content PASS / Visual PASS
- 02 Workflow: Structure PASS / Typography PASS / Content PASS / Visual PASS
- 03 AI Chat Home: Structure PASS / Typography PASS / Content PASS / Visual PASS
- 04 My Center: Structure PASS / Typography PASS / Content PASS / Visual PASS
```

---

## Task 6: 执行 Batch B / Batch C / Batch D

**Files:**
- Modify pages and tests for `05-17`

- [ ] **Step 1: 按同样链路逐页执行 Batch B**

Run:
```text
05 -> 06 -> 07 -> 08 -> 09 -> 10 -> 11
每页都执行 screenshot + batch_get + failing test + implementation + local gate
```

- [ ] **Step 2: 按同样链路逐页执行 Batch C**

Run:
```text
12 -> 13 -> 14 -> 15
每页都执行 screenshot + batch_get + failing test + implementation + local gate
```

- [ ] **Step 3: 按同样链路逐页执行 Batch D**

Run:
```text
16 -> 17
每页都执行 screenshot + batch_get + failing test + implementation + local gate
```

---

## Task 7: 全量验收与上传

**Files:**
- Modify: `docs/superpowers/specs/2026-04-15-pencil-miniapp-mapping-and-acceptance.md`

- [ ] **Step 1: 运行全量测试**

Run:
```bash
./node_modules/.bin/jest --runInBand
```

Expected:
```text
PASS
```

- [ ] **Step 2: 更新 01-17 全量页面验收状态**

```md
- 01-17: all PASS
- Upload Eligible: Yes
```

- [ ] **Step 3: 上传开发版**

Run:
```bash
export PATH="/opt/homebrew/opt/node@18/bin:$PATH"
export MINIAPP_PRIVATE_KEY_REF="op://CS/mgsufs7b2x2o3gu2rw46q6mpam/MINIAPP_PRIVATE_KEY"
export MINIAPP_APPID="$(op read op://CS/mgsufs7b2x2o3gu2rw46q6mpam/MINIAPP_APPID)"
export MINIAPP_UPLOAD_DESC="Pencil full rewrite $(date '+%Y-%m-%d %H:%M:%S')"
export MINIAPP_ROBOT=1
npm run upload
```

Expected:
```text
Upload completed successfully.
```

