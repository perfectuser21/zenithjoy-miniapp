# Pencil Miniapp Mapping And Acceptance

**Date:** 2026-04-15  
**Source of truth:** `designs/pencil-ui.pen` and `generated/pencil-pages-labeled/logic-board.png`

## Goal

Rebuild the missing middle steps between Pencil and WeChat upload:

1. `Pencil page -> unique miniapp page` strict mapping
2. `Per-page screenshot acceptance -> upload` release gate

This document replaces the previous loose workflow where pages could be “functionally related” to a Pencil frame without being a true implementation of that frame.

## Step 2: Strict Page Mapping

### First-Level Pages

| Pencil Code | Pencil Page | Miniapp Route | Files | Current Status |
| --- | --- | --- | --- | --- |
| `01` | `Home` | `pages/index/index` | `miniprogram/pages/index/index.{js,wxml,wxss}` | `Partially mapped, still productized` |
| `02` | `Workflow` | `pages/ai-features/index` | `miniprogram/pages/ai-features/index.{js,wxml,wxss}` | `Mapped by route, not by layout` |
| `03` | `AI Chat Home` | `pages/assistant/index` | `miniprogram/pages/assistant/index.{js,wxml,wxss}` | `Mapped by route, partially productized` |
| `04` | `My Center` | `pages/user/user` | `miniprogram/pages/user/user.{js,wxml,wxss}` | `Mapped by route, partially productized` |

### Copywriter Main Flow

| Pencil Code | Pencil Page | Miniapp Route | Files | Current Status |
| --- | --- | --- | --- | --- |
| `05` | `Copywriter / Start` | `pages/copywriter/start/start` | `miniprogram/pages/copywriter/start/start.{js,wxml,wxss}` | `Needs screenshot-level verification` |
| `06` | `Copywriter / Step1 Keywords` | `pages/copywriter/keywords/keywords` | `miniprogram/pages/copywriter/keywords/keywords.{js,wxml,wxss}` | `Needs screenshot-level verification` |
| `07` | `Copywriter / Step2 Ideas` | `pages/copywriter/ideas/ideas` | `miniprogram/pages/copywriter/ideas/ideas.{js,wxml,wxss}` | `Needs screenshot-level verification` |
| `08` | `Copywriter / Step3 Profile` | `pages/copywriter/profile/profile` | `miniprogram/pages/copywriter/profile/profile.{js,wxml,wxss}` | `Needs screenshot-level verification` |
| `09` | `Copywriter / Step4 Topics` | `pages/copywriter/topics/topics` | `miniprogram/pages/copywriter/topics/topics.{js,wxml,wxss}` | `Needs screenshot-level verification` |
| `10` | `Copywriter / Step5 Articles` | `pages/copywriter/articles/articles` | `miniprogram/pages/copywriter/articles/articles.{js,wxml,wxss}` | `Needs screenshot-level verification` |
| `11` | `Copywriter / Step6 Detail` | `pages/copywriter/article-detail/article-detail` | `miniprogram/pages/copywriter/article-detail/article-detail.{js,wxml,wxss}` | `Mapped by flow, needs screenshot-level verification` |

### Secondary Flows

| Pencil Code | Pencil Page | Miniapp Route | Files | Current Status |
| --- | --- | --- | --- | --- |
| `12` | `Title Generate` | `pages/copywriter/title-generate/title-generate` | `miniprogram/pages/copywriter/title-generate/title-generate.{js,wxml,wxss}` | `Mapped by route, content is runtime-driven` |
| `13` | `Title Library` | `pages/copywriter/title-library/title-library` | `miniprogram/pages/copywriter/title-library/title-library.{js,wxml,wxss}` | `Mapped by route, content is runtime-driven` |
| `14` | `Moments Generate` | `pages/copywriter/moments-generate/moments-generate` | `miniprogram/pages/copywriter/moments-generate/moments-generate.{js,wxml,wxss}` | `Layout close, runtime content diverges` |
| `15` | `Moments Editor` | `pages/copywriter/moments-editor/moments-editor` | `miniprogram/pages/copywriter/moments-editor/moments-editor.{js,wxml,wxss}` | `Over-productized, diverges from Pencil panel layout` |
| `16` | `Ranking Detail` | `pages/ranking/detail/detail` | `miniprogram/pages/ranking/detail/detail.{js,wxml,wxss}` | `Mapped by route, needs screenshot-level verification` |
| `17` | `Reading Detail` | `pages/reading-list/detail/detail` | `miniprogram/pages/reading-list/detail/detail.{js,wxml,wxss}` | `Mapped by route, needs screenshot-level verification` |

## Current Mismatch Types

### Type A: Route matches, page role does not

This is the most important mismatch. The route is correct, but the page has been implemented as a “product explanation page” or a “working tool page” instead of the actual Pencil layout.

Affected pages:

- `01 Home`
- `02 Workflow`
- `15 Moments Editor`

### Type B: Layout structure is close, but content is runtime-driven

The card sequence resembles the design, but the actual visible copy depends on dynamic data or local state, so what appears in the miniapp often differs from the Pencil page.

Affected pages:

- `12 Title Generate`
- `13 Title Library`
- `14 Moments Generate`

### Type C: Route and intent match, but screenshot-level verification has not happened

These pages may already be roughly aligned, but there is no evidence-based page acceptance yet.

Affected pages:

- `05` to `11`
- `16`
- `17`
- `03`
- `04`

## Highest-Priority Mismatches

### `01 Home`

**Current implementation:** `miniprogram/pages/index/index.{js,wxml,wxss}`

**Why it diverges:**

- uses explanatory product copy such as “首页只做正式入口分发”
- member chip includes product status data instead of acting as a pure visual control
- ranking/create/collection sections are rendered as product cards rather than the tighter Pencil card composition

**What the page must become:**

- a true Pencil home page
- light visual sections
- clear ranking entry, workflow entry, reading entry
- less product explanation, more direct visual hierarchy

### `02 Workflow`

**Current implementation:** `miniprogram/pages/ai-features/index.{js,wxml,wxss}`

**Why it diverges:**

- no top banner image
- currently implemented as three stacked explanatory cards
- missing the Pencil structure of `banner -> createTools -> titleSection -> momentsSection -> bottom pill`

**What the page must become:**

- a route hub page that visually matches the Pencil frame
- proper section geometry and image use
- workflow choice presented as layout, not as documentation

### `14 Moments Generate`

**Current implementation:** `miniprogram/pages/copywriter/moments-generate/moments-generate.{js,wxml,wxss}`

**Why it diverges:**

- layout is relatively close
- but main visible content is injected from `sourceContext.articleContent` and runtime chip arrays
- users compare against Pencil screenshot, but miniapp shows runtime content instead

**What the page must become:**

- either a true design-state presentation for the approved flow
- or a clearly defined runtime variant that still preserves every visual block and content hierarchy from Pencil

### `15 Moments Editor`

**Current implementation:** `miniprogram/pages/copywriter/moments-editor/moments-editor.{js,wxml,wxss}`

**Why it diverges:**

- implemented as a richer production editor
- adds draft list, scrolling selection, textarea editing, recommendation logic
- Pencil page is much simpler and more panel-based

**What the page must become:**

- first match the Pencil panel layout
- only then reintroduce editor interactions if they can live inside the same geometry

## Step 3: Screenshot Acceptance Before Upload

Upload is no longer allowed to act as the first verification step.

### Acceptance Rule

For each mapped page:

1. Confirm the Pencil frame code and exported screenshot
2. Confirm the unique miniapp route and file trio
3. Compare the miniapp page against the Pencil screenshot
4. Mark the page as one of:
   - `PASS`
   - `PASS WITH RUNTIME VARIANCE`
   - `FAIL`
5. Only upload when all pages in the current release batch are `PASS` or explicitly accepted as `PASS WITH RUNTIME VARIANCE`

### Required Per-Page Acceptance Record

For each page, record:

- Pencil code
- miniapp route
- visual status
- structural status
- content status
- upload eligibility

### Current Batch Acceptance

The following table tracks the current state after rebuilding page-role alignment and default design-state content.  
`Upload Eligible` remains `No` until screenshot-level review is completed for the release batch.

| Pencil Code | Route | Visual | Structure | Content | Upload Eligible |
| --- | --- | --- | --- | --- | --- |
| `01` | `pages/index/index` | `Partial` | `PASS` | `PASS` | `No` |
| `02` | `pages/ai-features/index` | `Partial` | `PASS` | `PASS` | `No` |
| `05` | `pages/copywriter/start/start` | `Partial` | `PASS` | `PASS` | `No` |
| `06` | `pages/copywriter/keywords/keywords` | `Partial` | `PASS` | `PASS` | `No` |
| `07` | `pages/copywriter/ideas/ideas` | `Partial` | `PASS` | `PASS` | `No` |
| `08` | `pages/copywriter/profile/profile` | `Partial` | `PASS` | `PASS` | `No` |
| `09` | `pages/copywriter/topics/topics` | `Partial` | `PASS` | `PASS` | `No` |
| `10` | `pages/copywriter/articles/articles` | `Partial` | `PASS` | `PASS` | `No` |
| `11` | `pages/copywriter/article-detail/article-detail` | `Partial` | `PASS` | `PASS` | `No` |
| `12` | `pages/copywriter/title-generate/title-generate` | `Partial` | `PASS` | `PASS WITH RUNTIME VARIANCE` | `No` |
| `13` | `pages/copywriter/title-library/title-library` | `Partial` | `PASS` | `PASS WITH RUNTIME VARIANCE` | `No` |
| `14` | `pages/copywriter/moments-generate/moments-generate` | `Partial` | `PASS` | `PASS WITH RUNTIME VARIANCE` | `No` |
| `15` | `pages/copywriter/moments-editor/moments-editor` | `Partial` | `PASS` | `PASS WITH RUNTIME VARIANCE` | `No` |
| `16` | `pages/ranking/detail/detail` | `Partial` | `PASS` | `PASS` | `No` |
| `17` | `pages/reading-list/detail/detail` | `Partial` | `PASS` | `PASS` | `No` |

This table should be updated every time a page is modified or a screenshot review is completed.

## Upload Gate

Before any miniapp upload:

1. Freeze the upload workspace
2. Verify `git status --short`
3. Confirm which modified files belong to the approved release batch
4. Confirm every page in the release batch has a screenshot acceptance row
5. Upload only that batch

### Hard Rules

- Do not upload from an unreviewed dirty workspace
- Do not upload pages that only “roughly correspond” to a Pencil frame
- Do not treat route correctness as design correctness
- Do not mix screenshot-unverified pages into a release upload

## Immediate Execution Order

Rebuild acceptance in this order:

1. `01 Home`
2. `02 Workflow`
3. `14 Moments Generate`
4. `15 Moments Editor`
5. `05` to `11` Copywriter main flow
6. `12` and `13`
7. `16` and `17`
8. `03` and `04`

This order matches the highest current divergence and the highest user-visible impact.
