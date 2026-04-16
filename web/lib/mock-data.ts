export type LinkAction = {
  label: string;
  href: string;
  tone?: "primary" | "secondary";
};

export type ShowcaseCard = {
  eyebrow?: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
  emphasis?: "primary" | "secondary";
};

export type StepPageData = {
  title: string;
  code: string;
  description: string;
  backHref: string;
  nextHref?: string;
  nextLabel?: string;
  chips?: string[];
  highlights: ShowcaseCard[];
};

export const homeData = {
  title: "ZenithJoy",
  subtitle: "面向创作者的一人公司操作系统",
  memberLabel: "会员中心",
  heroTitle: "内容灵感与执行流在这里汇合",
  heroDescription: "首页只做入口。正式创作从工作流进入，保证路径清晰、执行连续。",
  heroAction: { label: "进入工作流", href: "/workflow" },
  ranking: [
    { title: "小红书日榜", description: "看今天最值得跟进的话题和表达方式", href: "/ranking/detail", emphasis: "primary" as const },
    { title: "短视频热榜", description: "抓取高传播结构，快速拆解成自己的素材", href: "/ranking/detail", emphasis: "secondary" as const },
    { title: "平台话题榜", description: "用榜单判断今天最值得做什么内容", href: "/ranking/detail", emphasis: "secondary" as const }
  ],
  creationEntry: {
    title: "自媒体创作区域",
    description: "这里不直接分叉工具，统一进入工作流页，再选择标题、文案或朋友圈路径。",
    action: { label: "进入工作流", href: "/workflow" }
  },
  reading: [
    { title: "前沿创作集", description: "按主题阅读一线创作者的方法和表达结构", href: "/reading/detail", emphasis: "primary" as const },
    { title: "方法拆解", description: "看清每一类内容为什么有效", href: "/reading/detail", emphasis: "secondary" as const },
    { title: "表达风格库", description: "建立自己的参考面板和语气感", href: "/reading/detail", emphasis: "secondary" as const }
  ]
};

export const workflowData = {
  title: "工作流",
  subtitle: "把今天要做的内容直接推进到结果",
  flows: [
    {
      title: "自媒体创作",
      description: "从关键词、想法和资料补充进入选题与文案成稿。",
      href: "/copywriter/start",
      action: "进入自媒体创作"
    },
    {
      title: "标题创作",
      description: "先生成一批标题，再挑出最适合发布的版本。",
      href: "/title/generate",
      action: "进入标题创作"
    },
    {
      title: "朋友圈文案",
      description: "先生成，再进入精修页做结构和语气调整。",
      href: "/moments/generate",
      action: "进入朋友圈文案"
    }
  ]
};

export const assistantData = {
  title: "AI 助理首页",
  subtitle: "独立一级页，用于查看助手入口和近期对话。",
  cards: [
    { title: "选题助手", description: "帮你快速判断今天适合做什么内容。" },
    { title: "结构助手", description: "把长想法整理成清晰的大纲与段落。" },
    { title: "复盘助手", description: "把发过的内容拆出方法和可复用模式。" }
  ]
};

export const meData = {
  title: "我的",
  subtitle: "独立一级页，用于展示会员、积分与历史记录。",
  cards: [
    { title: "成长会员", description: "查看权益、积分和最近使用记录。" },
    { title: "我的作品", description: "回看最近生成过的标题、文案和朋友圈内容。" },
    { title: "任务与签到", description: "保持节奏感和每日执行反馈。" }
  ]
};

export const copywriterSteps: Record<string, StepPageData> = {
  start: {
    title: "Copywriter / Start",
    code: "r05",
    description: "确认今天创作任务的起点，再进入关键词整理。",
    backHref: "/workflow",
    nextHref: "/copywriter/keywords",
    nextLabel: "开始整理关键词",
    chips: ["内容目标", "平台方向", "表达语气"],
    highlights: [
      { eyebrow: "起点", title: "今天准备写什么", description: "先定内容目标，再进入关键词输入。", emphasis: "primary" },
      { title: "路径说明", description: "关键词 -> 想法 -> 资料 -> 选题 -> 文案版本 -> 详情", emphasis: "secondary" }
    ]
  },
  keywords: {
    title: "Copywriter / Step1 Keywords",
    code: "r06",
    description: "围绕主题输入关键词，建立后续想法和选题的素材底盘。",
    backHref: "/copywriter/start",
    nextHref: "/copywriter/ideas",
    nextLabel: "继续到想法补充",
    chips: ["用户问题", "场景词", "结果词", "冲突词"],
    highlights: [
      { eyebrow: "关键词", title: "优先挑选 2-3 种", description: "把关键词控制在有效密度，避免噪声过多。", emphasis: "primary" },
      { title: "当前输入建议", description: "优先放需求词、用户表达词和可验证结果词。", emphasis: "secondary" }
    ]
  },
  ideas: {
    title: "Copywriter / Step2 Ideas",
    code: "r07",
    description: "补充你已有的判断、角度和案例，让生成更贴近真实表达。",
    backHref: "/copywriter/keywords",
    nextHref: "/copywriter/profile",
    nextLabel: "继续到资料完善",
    chips: ["我的观点", "案例碎片", "反常识判断"],
    highlights: [
      { eyebrow: "想法", title: "把已有判断写出来", description: "生成不是替你思考，而是放大你已明确的角度。", emphasis: "primary" },
      { title: "补充建议", description: "可写自己的故事、见闻、踩坑和想反驳的常见观点。", emphasis: "secondary" }
    ]
  },
  profile: {
    title: "Copywriter / Step3 Profile",
    code: "r08",
    description: "补齐身份、产品和受众信息，为选题和文案设定真实边界。",
    backHref: "/copywriter/ideas",
    nextHref: "/copywriter/topics",
    nextLabel: "继续到选题选择",
    chips: ["你是谁", "服务谁", "卖什么"],
    highlights: [
      { eyebrow: "资料", title: "让内容有真实定位", description: "把身份、用户和产品说清楚，避免空泛表达。", emphasis: "primary" },
      { title: "输入范围", description: "包括账号定位、产品特征、用户阶段和语气偏好。", emphasis: "secondary" }
    ]
  },
  topics: {
    title: "Copywriter / Step4 Topics",
    code: "r09",
    description: "从候选选题中挑出最值得推进的一条内容线。",
    backHref: "/copywriter/profile",
    nextHref: "/copywriter/articles",
    nextLabel: "查看文案版本",
    chips: ["高点击", "高传播", "高转化"],
    highlights: [
      { eyebrow: "选题", title: "目标选择策略", description: "优先选择兼顾传播和表达张力的主题。", emphasis: "primary" },
      { title: "当前选择需求", description: "先选 1 条主线，再考虑要不要补充备选版本。", emphasis: "secondary" }
    ]
  },
  articles: {
    title: "Copywriter / Step5 Articles",
    code: "r10",
    description: "查看生成出的多个文案版本，先筛结构，再看语气。",
    backHref: "/copywriter/topics",
    nextHref: "/copywriter/detail",
    nextLabel: "进入文案详情",
    chips: ["故事型", "清单型", "观点型"],
    highlights: [
      { eyebrow: "版本", title: "先看开头和结构", description: "不要一开始就盯字句，先看哪版更像你。", emphasis: "primary" },
      { title: "比较逻辑", description: "用钩子、推进和结尾力度来比较版本。", emphasis: "secondary" }
    ]
  },
  detail: {
    title: "Copywriter / Step6 Detail",
    code: "r11",
    description: "进入单篇详情页，继续修改、收藏或导出。",
    backHref: "/copywriter/articles",
    chips: ["段落结构", "口语感", "行动号召"],
    highlights: [
      { eyebrow: "详情", title: "把这篇文案修到可发布", description: "此页聚焦最终文本和动作按钮。", emphasis: "primary" },
      { title: "后续动作", description: "可以基于当前版本继续改写、收藏或复制。", emphasis: "secondary" }
    ]
  }
};

export const titlePages: Record<string, StepPageData> = {
  generate: {
    title: "标题创作 / 生成页",
    code: "r12",
    description: "先生成标题方向，再进入备选库挑选。",
    backHref: "/workflow",
    nextHref: "/title/library",
    nextLabel: "查看标题备选库",
    chips: ["反差型", "结果型", "问题型"],
    highlights: [
      { eyebrow: "标题", title: "先批量出方向", description: "不要过早精修，先把强弱差异拉开。", emphasis: "primary" },
      { title: "生成建议", description: "围绕用户结果、冲突和阶段感去生成。", emphasis: "secondary" }
    ]
  },
  library: {
    title: "标题创作 / 备选库",
    code: "r13",
    description: "在候选标题中筛选最值得测试的一组。",
    backHref: "/title/generate",
    chips: ["高点击", "品牌感", "转化向"],
    highlights: [
      { eyebrow: "标题库", title: "从方向里挑最适合发布的", description: "对比点击感、语气匹配度和内容真实度。", emphasis: "primary" },
      { title: "筛选策略", description: "保留 3-5 个版本，避免只看单条标题。", emphasis: "secondary" }
    ]
  }
};

export const momentsPages: Record<string, StepPageData> = {
  generate: {
    title: "朋友圈文案 / 生成页",
    code: "r14",
    description: "按目标快速出初稿，再进入精修页处理语气和结构。",
    backHref: "/workflow",
    nextHref: "/moments/editor",
    nextLabel: "进入朋友圈精修",
    chips: ["日常感", "种草感", "成交感"],
    highlights: [
      { eyebrow: "朋友圈", title: "先生成再精修", description: "这一步先把结构跑出来，下一步再修语言细节。", emphasis: "primary" },
      { title: "输入建议", description: "用场景、产品、情绪和动作目标来提高初稿质量。", emphasis: "secondary" }
    ]
  },
  editor: {
    title: "朋友圈文案 / 精修页",
    code: "r15",
    description: "精修句式、留白和成交动作，让文案更像自然表达。",
    backHref: "/moments/generate",
    chips: ["去 AI 味", "增强口语感", "补结尾动作"],
    highlights: [
      { eyebrow: "精修", title: "把语气和节奏调顺", description: "重点看第一句、转折处和最后一句动作。", emphasis: "primary" },
      { title: "编辑动作", description: "可以删掉过满表达，补进更真实的场景细节。", emphasis: "secondary" }
    ]
  }
};

export const rankingDetail: StepPageData = {
  title: "今日榜单 / 榜单详情",
  code: "r16",
  description: "查看榜单内容、表现亮点和可借鉴结构。",
  backHref: "/",
  chips: ["选题", "结构", "表达", "封面"],
  highlights: [
    { eyebrow: "榜单详情", title: "今天值得先看的内容样本", description: "把流量点、表达方式和结构亮点分开看。", emphasis: "primary" },
    { title: "使用方式", description: "把它当作方法样本，而不是直接模仿对象。", emphasis: "secondary" }
  ]
};

export const readingDetail: StepPageData = {
  title: "自媒体前沿创作集 / 详情页",
  code: "r17",
  description: "阅读一线创作者的内容样本和风格拆解。",
  backHref: "/",
  chips: ["选题风格", "表达语气", "结构节奏"],
  highlights: [
    { eyebrow: "创作集", title: "把好的表达拆成可复用方法", description: "从主题、语气和结构看它为什么成立。", emphasis: "primary" },
    { title: "阅读方式", description: "优先看和你内容阶段最接近的样本。", emphasis: "secondary" }
  ]
};
