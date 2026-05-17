# Pencil Next.js Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `web/` Next.js + Tailwind prototype site that reproduces all finalized Pencil screens with full routing and clickable flow navigation.

**Architecture:** Add an isolated web app under `web/` using Next.js App Router. Create a small shared shell for mobile-first page rendering and desktop presentation, then implement page routes from the Pencil logic board using local mock data.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Jest or Vitest-compatible smoke tests, local mock data

---

### Task 1: Scaffold the `web/` app

**Files:**
- Create: `web/package.json`
- Create: `web/tsconfig.json`
- Create: `web/next.config.ts`
- Create: `web/postcss.config.js`
- Create: `web/tailwind.config.ts`
- Create: `web/app/layout.tsx`
- Create: `web/app/globals.css`
- Create: `web/app/page.tsx`
- Create: `web/components/`

- [ ] **Step 1: Write the failing test**

Create `web/app/page.tsx` import targets before they exist so build/typecheck fails. Use:

```tsx
import { AppShell } from "@/components/app-shell";

export default function HomePage() {
  return <AppShell title="Home" />;
}
```

- [ ] **Step 2: Run verification to confirm failure**

Run: `cd web && npm run build`
Expected: FAIL with module resolution errors for missing config or missing `@/components/app-shell`

- [ ] **Step 3: Write the minimal implementation**

Create the base app files with:

```json
{
  "name": "@zenithjoy/web-prototype",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint"
  }
}
```

Create `web/app/layout.tsx` with:

```tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZenithJoy Prototype",
  description: "Pencil-aligned web prototype"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Create `web/components/app-shell.tsx` with:

```tsx
export function AppShell({ title }: { title: string }) {
  return <main>{title}</main>;
}
```

- [ ] **Step 4: Run verification to confirm pass**

Run: `cd web && npm run build`
Expected: PASS and emit Next.js production build output

- [ ] **Step 5: Commit**

```bash
git add web
git commit -m "feat(web): scaffold nextjs prototype app"
```

### Task 2: Add shared shell, route manifest, and mock content

**Files:**
- Create: `web/components/app-shell.tsx`
- Create: `web/components/bottom-nav.tsx`
- Create: `web/components/mobile-stage.tsx`
- Create: `web/lib/routes.ts`
- Create: `web/lib/mock-data.ts`
- Modify: `web/app/layout.tsx`
- Test: `web/lib/routes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/lib/routes.test.ts`:

```ts
import { primaryRoutes, secondaryRoutes } from "./routes";

test("includes the four primary routes", () => {
  expect(primaryRoutes.map((route) => route.href)).toEqual([
    "/",
    "/workflow",
    "/assistant",
    "/me"
  ]);
});

test("includes the copywriter sequence and detail routes", () => {
  expect(secondaryRoutes.map((route) => route.href)).toEqual(
    expect.arrayContaining([
      "/copywriter/start",
      "/copywriter/keywords",
      "/copywriter/ideas",
      "/copywriter/profile",
      "/copywriter/topics",
      "/copywriter/articles",
      "/copywriter/detail",
      "/title/generate",
      "/title/library",
      "/moments/generate",
      "/moments/editor",
      "/ranking/detail",
      "/reading/detail"
    ])
  );
});
```

- [ ] **Step 2: Run verification to confirm failure**

Run: `cd web && npm test -- routes.test.ts`
Expected: FAIL because `web/lib/routes.ts` and test runner config do not exist yet

- [ ] **Step 3: Write the minimal implementation**

Create a route manifest like:

```ts
export const primaryRoutes = [
  { href: "/", label: "首页" },
  { href: "/workflow", label: "工作流" },
  { href: "/assistant", label: "AI 助理" },
  { href: "/me", label: "我的" }
];

export const secondaryRoutes = [
  { href: "/copywriter/start", label: "开始页" },
  { href: "/copywriter/keywords", label: "关键词输入" },
  { href: "/copywriter/ideas", label: "想法补充" },
  { href: "/copywriter/profile", label: "资料完善" },
  { href: "/copywriter/topics", label: "选题选择" },
  { href: "/copywriter/articles", label: "文案版本" },
  { href: "/copywriter/detail", label: "文案详情" },
  { href: "/title/generate", label: "标题生成" },
  { href: "/title/library", label: "标题备选库" },
  { href: "/moments/generate", label: "朋友圈文案生成" },
  { href: "/moments/editor", label: "朋友圈文案精修" },
  { href: "/ranking/detail", label: "榜单详情" },
  { href: "/reading/detail", label: "创作集详情" }
];
```

Add shared shell components that accept `title`, `activeTab`, and children, and render a centered desktop stage plus mobile-first content frame.

- [ ] **Step 4: Run verification to confirm pass**

Run: `cd web && npm test -- routes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web
git commit -m "feat(web): add shared shell and route manifest"
```

### Task 3: Implement first-level routes

**Files:**
- Create: `web/app/workflow/page.tsx`
- Create: `web/app/assistant/page.tsx`
- Create: `web/app/me/page.tsx`
- Modify: `web/app/page.tsx`
- Create: `web/components/section-card.tsx`
- Modify: `web/lib/mock-data.ts`
- Test: `web/app/primary-routes.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/app/primary-routes.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";
import WorkflowPage from "./workflow/page";

test("home includes entry to workflow", () => {
  render(<HomePage />);
  expect(screen.getByText("进入工作流")).toBeInTheDocument();
});

test("workflow includes the three major creation paths", () => {
  render(<WorkflowPage />);
  expect(screen.getByText("自媒体创作")).toBeInTheDocument();
  expect(screen.getByText("标题创作")).toBeInTheDocument();
  expect(screen.getByText("朋友圈文案")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run verification to confirm failure**

Run: `cd web && npm test -- primary-routes.test.tsx`
Expected: FAIL because the page content and test setup do not exist yet

- [ ] **Step 3: Write the minimal implementation**

Implement:

- `Home` with ranking entry, workflow entry, and reading collection entry
- `Workflow` with the three grouped flows
- `Assistant` as top-level static screen
- `Me` as top-level static screen

Use shared cards and mock data. Ensure the `Home` page does not expose direct multi-tool branching outside the workflow hub.

- [ ] **Step 4: Run verification to confirm pass**

Run: `cd web && npm test -- primary-routes.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web
git commit -m "feat(web): add primary routes"
```

### Task 4: Implement secondary routes and flow links

**Files:**
- Create: `web/app/copywriter/start/page.tsx`
- Create: `web/app/copywriter/keywords/page.tsx`
- Create: `web/app/copywriter/ideas/page.tsx`
- Create: `web/app/copywriter/profile/page.tsx`
- Create: `web/app/copywriter/topics/page.tsx`
- Create: `web/app/copywriter/articles/page.tsx`
- Create: `web/app/copywriter/detail/page.tsx`
- Create: `web/app/title/generate/page.tsx`
- Create: `web/app/title/library/page.tsx`
- Create: `web/app/moments/generate/page.tsx`
- Create: `web/app/moments/editor/page.tsx`
- Create: `web/app/ranking/detail/page.tsx`
- Create: `web/app/reading/detail/page.tsx`
- Create: `web/components/flow-header.tsx`
- Modify: `web/lib/mock-data.ts`
- Test: `web/app/flow-links.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/app/flow-links.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import WorkflowPage from "./workflow/page";

test("workflow links into copywriter, title, and moments flows", () => {
  render(<WorkflowPage />);
  expect(screen.getByRole("link", { name: /进入自媒体创作/i })).toHaveAttribute("href", "/copywriter/start");
  expect(screen.getByRole("link", { name: /进入标题创作/i })).toHaveAttribute("href", "/title/generate");
  expect(screen.getByRole("link", { name: /进入朋友圈文案/i })).toHaveAttribute("href", "/moments/generate");
});
```

- [ ] **Step 2: Run verification to confirm failure**

Run: `cd web && npm test -- flow-links.test.tsx`
Expected: FAIL because link text or route targets are missing

- [ ] **Step 3: Write the minimal implementation**

Implement each secondary route with:

- page title matching the Pencil frame
- high-fidelity card structure based on the exported screenshots
- back links to the appropriate parent route
- forward CTAs for the next step in each flow

Keep the flow order:

- Copywriter: `start -> keywords -> ideas -> profile -> topics -> articles -> detail`
- Title: `generate -> library`
- Moments: `generate -> editor`

Also add:

- `Ranking Detail` reachable from `Home`
- `Reading Detail` reachable from `Home`

- [ ] **Step 4: Run verification to confirm pass**

Run: `cd web && npm test -- flow-links.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web
git commit -m "feat(web): add secondary flow routes"
```

### Task 5: Finish styling, assets, and verification

**Files:**
- Modify: `web/app/globals.css`
- Modify: `web/components/*.tsx`
- Create: `web/public/`
- Create: `web/README.md`
- Test: `web/app/smoke-routes.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/app/smoke-routes.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import MomentsGeneratePage from "./moments/generate/page";
import RankingDetailPage from "./ranking/detail/page";

test("moments page renders its title", () => {
  render(<MomentsGeneratePage />);
  expect(screen.getByText("朋友圈文案 / 生成页")).toBeInTheDocument();
});

test("ranking detail page renders its title", () => {
  render(<RankingDetailPage />);
  expect(screen.getByText("今日榜单 / 榜单详情")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run verification to confirm failure**

Run: `cd web && npm test -- smoke-routes.test.tsx`
Expected: FAIL until the target pages and test harness are fully wired

- [ ] **Step 3: Write the minimal implementation**

Finish:

- Tailwind tokens and global background treatment
- copied local assets for hero and visual cards
- desktop stage framing
- page-level polish to match Pencil screenshots
- a short `web/README.md` describing how to run the prototype

- [ ] **Step 4: Run full verification**

Run:

```bash
cd web && npm test
cd web && npm run build
```

Expected:

- all web tests PASS
- Next.js production build PASS

- [ ] **Step 5: Commit**

```bash
git add web
git commit -m "feat(web): finish pencil-aligned prototype site"
```
