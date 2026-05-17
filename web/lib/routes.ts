export type TabKey = "home" | "workflow" | "assistant" | "me" | null;

export type AppRoute = {
  href: string;
  label: string;
  tab: TabKey;
};

export const primaryRoutes: AppRoute[] = [
  { href: "/", label: "首页", tab: "home" },
  { href: "/workflow", label: "工作流", tab: "workflow" },
  { href: "/assistant", label: "AI 助理", tab: "assistant" },
  { href: "/me", label: "我的", tab: "me" }
];

export const secondaryRoutes: AppRoute[] = [
  { href: "/copywriter/start", label: "开始页", tab: null },
  { href: "/copywriter/keywords", label: "关键词输入", tab: null },
  { href: "/copywriter/ideas", label: "想法补充", tab: null },
  { href: "/copywriter/profile", label: "资料完善", tab: null },
  { href: "/copywriter/topics", label: "选题选择", tab: null },
  { href: "/copywriter/articles", label: "文案版本", tab: null },
  { href: "/copywriter/detail", label: "文案详情", tab: null },
  { href: "/title/generate", label: "标题生成", tab: null },
  { href: "/title/library", label: "标题备选库", tab: null },
  { href: "/moments/generate", label: "朋友圈文案生成", tab: null },
  { href: "/moments/editor", label: "朋友圈文案精修", tab: null },
  { href: "/ranking/detail", label: "榜单详情", tab: null },
  { href: "/reading/detail", label: "创作集详情", tab: null }
];
