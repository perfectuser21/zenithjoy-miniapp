# Pencil Miniapp Sync Batch 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让小程序的 `Home`、`Workflow`、`朋友圈文案生成`、`朋友圈文案精修` 四页通过当前 Pencil 设计稿的结构、字号和截图级验收，并在通过 gate 后再上传开发版。

**Architecture:** 以 `designs/pencil-ui.pen` 为唯一真相源，先重建 `Home` 和 `Workflow` 的页面结构，再逐项校准 `14/15` 的 typography 和节点细节。每页都先写失败测试锁住目标结构，再做最小实现，最后执行截图 gate 和上传 gate。

**Tech Stack:** WeChat Mini Program (`WXML/WXSS/JS`), Jest, Pencil MCP, `miniprogram-ci`

---

### Task 1: 锁定 Home 当前结构与字号规则

**Files:**
- Modify: `__tests__/pages/index-routing.test.js`
- Modify: `miniprogram/pages/index/index.wxml`
- Modify: `miniprogram/pages/index/index.wxss`
- Reference: `docs/superpowers/specs/2026-04-15-pencil-miniapp-release-sop.md`

- [ ] **Step 1: 写失败测试，锁住 Home 的当前 Pencil 结构**

```js
test('home matches pencil home structure', () => {
  const page = require('../../miniprogram/pages/index/index');
  const data = page.data || {};

  expect(data.homeTitle || data.heroTitle).toBe('今天先做什么');
  expect(data.rankingItems).toHaveLength(3);
  expect(data.collectionItems).toHaveLength(3);
});
```

- [ ] **Step 2: 运行测试，确认失败**

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

- [ ] **Step 3: 最小实现 Home 结构**

`miniprogram/pages/index/index.wxml`
```xml
<view class="home-page">
  <view class="home-shell" style="padding-top: {{statusBarHeight + 16}}px;">
    <view class="home-head">
      <view class="home-head-text">
        <view class="home-title">{{homeTitle}}</view>
      </view>
      <view class="home-user-entry" bindtap="openMembership">
        <view class="home-user-avatar"></view>
        <view class="home-user-meta">
          <view class="home-user-label">{{userEntry.label}}</view>
          <view class="home-user-points">{{userEntry.points}}</view>
        </view>
      </view>
    </view>
    <!-- hero / ranking / create grid / collection / pill -->
  </view>
</view>
```

`miniprogram/pages/index/index.wxss`
```css
.home-title {
  font-size: 46rpx;
  font-weight: 700;
  color: #111827;
}

.home-ranking-name,
.home-collection-title {
  font-size: 27rpx;
  font-weight: 700;
  color: #111827;
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/index-routing.test.js --runInBand
```

Expected:
```text
PASS __tests__/pages/index-routing.test.js
```

- [ ] **Step 5: 提交**

```bash
git add __tests__/pages/index-routing.test.js miniprogram/pages/index/index.wxml miniprogram/pages/index/index.wxss
git commit -m "fix(home): sync structure and hierarchy to current pencil"
```

### Task 2: 锁定 Workflow 当前结构与字号规则

**Files:**
- Modify: `__tests__/pages/ai-features-routing.test.js`
- Modify: `miniprogram/pages/ai-features/index.wxml`
- Modify: `miniprogram/pages/ai-features/index.wxss`

- [ ] **Step 1: 写失败测试，锁住 Workflow 的三段结构**

```js
test('workflow matches pencil sections', () => {
  const page = require('../../miniprogram/pages/ai-features/index');
  const data = page.data || {};

  expect(data.pageTitle).toBe('今天创作什么');
  expect(data.flowSteps).toHaveLength(4);
  expect(data.titleChips.length).toBeGreaterThanOrEqual(6);
  expect(data.momentsChips.length).toBeGreaterThanOrEqual(3);
});
```

- [ ] **Step 2: 运行测试，确认失败**

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

- [ ] **Step 3: 最小实现 Workflow 结构**

`miniprogram/pages/ai-features/index.wxml`
```xml
<view class="p-page">
  <view class="p-shell" style="padding-top: {{statusBarHeight + 16}}px;">
    <view class="p-head">
      <view class="p-head-left">
        <view class="p-brand">{{eyebrow}}</view>
        <view class="p-page-title">{{pageTitle}}</view>
      </view>
      <view class="p-stat">{{availablePoints}}</view>
    </view>
    <!-- banner / createTools / titleSection / momentsSection / pill -->
  </view>
</view>
```

`miniprogram/pages/ai-features/index.wxss`
```css
.p-page-title {
  font-size: 62rpx;
  font-weight: 700;
  color: #121826;
}

.p-section-title {
  font-size: 35rpx;
  font-weight: 700;
  color: #1d2340;
}

.p-chip-text,
.p-cta-text {
  font-size: 27rpx;
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/ai-features-routing.test.js --runInBand
```

Expected:
```text
PASS __tests__/pages/ai-features-routing.test.js
```

- [ ] **Step 5: 提交**

```bash
git add __tests__/pages/ai-features-routing.test.js miniprogram/pages/ai-features/index.wxml miniprogram/pages/ai-features/index.wxss
git commit -m "fix(workflow): sync page structure to current pencil"
```

### Task 3: 校准 14 朋友圈文案生成页节点值

**Files:**
- Modify: `__tests__/pages/moments-pages.test.js`
- Modify: `miniprogram/pages/copywriter/moments-generate/moments-generate.wxml`
- Modify: `miniprogram/pages/copywriter/moments-generate/moments-generate.wxss`
- Modify: `miniprogram/pages/copywriter/moments-generate/moments-generate.js`

- [ ] **Step 1: 写失败测试，锁住 14 页关键字号与区块名**

```js
test('moments generate exposes pencil-aligned sections', () => {
  const page = require('../../miniprogram/pages/copywriter/moments-generate/moments-generate');
  const data = page.data || {};

  expect(data.heroCard.title).toContain('基于现有内容');
  expect(data.variantChoices).toHaveLength(6);
  expect(data.angleChoices).toHaveLength(8);
  expect(data.strategyChoices).toHaveLength(2);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/moments-pages.test.js --runInBand
```

Expected:
```text
FAIL
Expected variantChoices length: 6
```

- [ ] **Step 3: 最小实现 14 页节点同步**

`miniprogram/pages/copywriter/moments-generate/moments-generate.wxss`
```css
.studio-hero-title {
  font-size: 38rpx;
}

.section-title {
  font-size: 31rpx;
}

.chip,
.btn,
.btn-secondary {
  font-size: 27rpx;
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/moments-pages.test.js --runInBand
```

Expected:
```text
PASS __tests__/pages/moments-pages.test.js
```

- [ ] **Step 5: 提交**

```bash
git add __tests__/pages/moments-pages.test.js miniprogram/pages/copywriter/moments-generate/moments-generate.js miniprogram/pages/copywriter/moments-generate/moments-generate.wxml miniprogram/pages/copywriter/moments-generate/moments-generate.wxss
git commit -m "fix(moments): sync generate screen to pencil node values"
```

### Task 4: 校准 15 朋友圈文案精修页节点值

**Files:**
- Modify: `__tests__/pages/moments-pages.test.js`
- Modify: `miniprogram/pages/copywriter/moments-editor/moments-editor.wxml`
- Modify: `miniprogram/pages/copywriter/moments-editor/moments-editor.wxss`
- Modify: `miniprogram/pages/copywriter/moments-editor/moments-editor.js`

- [ ] **Step 1: 写失败测试，锁住 15 页关键区块和默认文案**

```js
test('moments editor exposes pencil-aligned panels', () => {
  const page = require('../../miniprogram/pages/copywriter/moments-editor/moments-editor');
  const data = page.data || {};

  expect(data.heroCard.title).toContain('选文案');
  expect(data.guideChips).toHaveLength(3);
  expect(data.draftCards.length).toBeGreaterThan(1);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/moments-pages.test.js --runInBand
```

Expected:
```text
FAIL
Expected data.guideChips to have length 3
```

- [ ] **Step 3: 最小实现 15 页节点同步**

`miniprogram/pages/copywriter/moments-editor/moments-editor.wxss`
```css
.hero-title {
  font-size: 35rpx;
}

.section-title {
  font-size: 31rpx;
}

.draft-content,
.guide-chip,
.btn,
.btn-secondary {
  font-size: 23rpx;
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/moments-pages.test.js --runInBand
```

Expected:
```text
PASS __tests__/pages/moments-pages.test.js
```

- [ ] **Step 5: 提交**

```bash
git add __tests__/pages/moments-pages.test.js miniprogram/pages/copywriter/moments-editor/moments-editor.js miniprogram/pages/copywriter/moments-editor/moments-editor.wxml miniprogram/pages/copywriter/moments-editor/moments-editor.wxss
git commit -m "fix(moments): sync editor screen to pencil node values"
```

### Task 5: 执行本地验收 Gate 并更新文档

**Files:**
- Modify: `docs/superpowers/specs/2026-04-15-pencil-miniapp-release-sop.md`
- Modify: `docs/superpowers/specs/2026-04-15-pencil-miniapp-mapping-and-acceptance.md`

- [ ] **Step 1: 运行页面相关测试**

Run:
```bash
./node_modules/.bin/jest __tests__/pages/index-routing.test.js __tests__/pages/ai-features-routing.test.js __tests__/pages/moments-pages.test.js --runInBand
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

- [ ] **Step 3: 更新验收文档状态**

```md
- Home: Structure PASS / Typography PASS / Content PASS / Visual PASS
- Workflow: Structure PASS / Typography PASS / Content PASS / Visual PASS
- Moments Generate: Structure PASS / Typography PASS / Content PASS / Visual PASS
- Moments Editor: Structure PASS / Typography PASS / Content PASS / Visual PASS
- Upload Eligible: Yes
```

- [ ] **Step 4: 提交**

```bash
git add docs/superpowers/specs/2026-04-15-pencil-miniapp-release-sop.md docs/superpowers/specs/2026-04-15-pencil-miniapp-mapping-and-acceptance.md
git commit -m "docs(miniapp): update acceptance gate after batch1 sync"
```

### Task 6: 通过 Gate 后上传开发版

**Files:**
- No code changes required

- [ ] **Step 1: 记录当前工作区状态**

Run:
```bash
git status --short
```

Expected:
```text
working tree clean
```

- [ ] **Step 2: 执行上传**

Run:
```bash
export PATH="/opt/homebrew/opt/node@18/bin:$PATH"
export MINIAPP_PRIVATE_KEY_REF="op://CS/mgsufs7b2x2o3gu2rw46q6mpam/MINIAPP_PRIVATE_KEY"
export MINIAPP_APPID="$(op read op://CS/mgsufs7b2x2o3gu2rw46q6mpam/MINIAPP_APPID)"
export MINIAPP_UPLOAD_DESC="Pencil acceptance batch 2 $(date '+%Y-%m-%d %H:%M:%S')"
export MINIAPP_ROBOT=1
npm run upload
```

Expected:
```text
Upload completed successfully.
```

- [ ] **Step 3: 记录上传结果**

```md
- Upload time: YYYY-MM-DD HH:MM:SS +0800
- Desc: Pencil acceptance batch 2 ...
- Scope: Home / Workflow / 14 / 15
```

- [ ] **Step 4: 提交上传记录文档**

```bash
git add docs/superpowers/specs/2026-04-15-pencil-miniapp-mapping-and-acceptance.md
git commit -m "docs(miniapp): record batch2 upload metadata"
```

