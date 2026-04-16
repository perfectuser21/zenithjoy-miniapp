export type PageKey =
  | 'today-ranking-detail'
  | 'reading-list-detail'
  | 'copywriter-start'
  | 'copywriter-keywords'
  | 'copywriter-ideas'
  | 'copywriter-profile'
  | 'copywriter-topics'
  | 'copywriter-articles'
  | 'copywriter-detail'
  | 'title-generate'
  | 'title-library'
  | 'moments-generate'
  | 'moments-refine';

export type NavGroup = {
  title: string;
  items: { key: PageKey; label: string; tag: string }[];
};

export type StepTone = {
  pageBg: string;
  pageBgTop: string;
  heroStart: string;
  heroEnd: string;
  orb: string;
};

export const navGroups: NavGroup[] = [
  {
    title: '首页二级页',
    items: [
      { key: 'today-ranking-detail', label: '16 今日榜单 / 榜单详情', tag: '01 首页' },
      { key: 'reading-list-detail', label: '17 自媒体前沿创作集 / 详情页', tag: '01 首页' },
    ],
  },
  {
    title: '工作流 · 自媒体创作',
    items: [
      { key: 'copywriter-start', label: '05 文案开始页', tag: '02 工作流' },
      { key: 'copywriter-keywords', label: '06 关键词输入', tag: '02 工作流' },
      { key: 'copywriter-ideas', label: '07 想法补充', tag: '02 工作流' },
      { key: 'copywriter-profile', label: '08 资料完善', tag: '02 工作流' },
      { key: 'copywriter-topics', label: '09 选题选择', tag: '02 工作流' },
      { key: 'copywriter-articles', label: '10 文案版本', tag: '02 工作流' },
      { key: 'copywriter-detail', label: '11 文案详情', tag: '02 工作流' },
    ],
  },
  {
    title: '工作流 · 标题创作',
    items: [
      { key: 'title-generate', label: '12 标题生成', tag: '02 工作流' },
      { key: 'title-library', label: '13 标题备选库', tag: '02 工作流' },
    ],
  },
  {
    title: '工作流 · 朋友圈文案',
    items: [
      { key: 'moments-generate', label: '14 朋友圈文案生成', tag: '02 工作流' },
      { key: 'moments-refine', label: '15 朋友圈文案精修', tag: '02 工作流' },
    ],
  },
];

export const workflowTones: Record<
  'start' | 'keywords' | 'ideas' | 'profile' | 'topics' | 'articles' | 'detail',
  StepTone
> = {
  start: {
    pageBg: '#F6F7FE',
    pageBgTop: '#F7FAFF',
    heroStart: '#1D4ED8',
    heroEnd: '#4F46E5',
    orb: '#FFFFFF20',
  },
  keywords: {
    pageBg: '#EEF4FF',
    pageBgTop: '#F4F7FF',
    heroStart: '#1D4ED8',
    heroEnd: '#2563EB',
    orb: '#FFFFFF24',
  },
  ideas: {
    pageBg: '#EBF7FF',
    pageBgTop: '#F2FBFA',
    heroStart: '#0F766E',
    heroEnd: '#0EA5A4',
    orb: '#CCFBF133',
  },
  profile: {
    pageBg: '#FFF2E7',
    pageBgTop: '#FFF8F1',
    heroStart: '#C2410C',
    heroEnd: '#EA580C',
    orb: '#FFF0E744',
  },
  topics: {
    pageBg: '#EEF2FF',
    pageBgTop: '#F5F7FF',
    heroStart: '#243BCE',
    heroEnd: '#3858F2',
    orb: '#CBD7FF33',
  },
  articles: {
    pageBg: '#EEF3FF',
    pageBgTop: '#F4F7FF',
    heroStart: '#1E40AF',
    heroEnd: '#3157D5',
    orb: '#D5DEFF30',
  },
  detail: {
    pageBg: '#F1F5FF',
    pageBgTop: '#F5F7FF',
    heroStart: '#2741C8',
    heroEnd: '#4F5EF0',
    orb: '#C7D5FF33',
  },
};

export const rankingRows = [
  {
    index: '01',
    title: '排名热榜 · AI 副业变道避坑手册',
    meta: '优势：热度高、评论活跃，适合先做趋势判断与避坑拆解。',
    tone: 'bg-violet-100 text-violet-700',
  },
  {
    index: '02',
    title: '低粉爆款榜 · 小切口案例复盘更容易起量',
    meta: '优势：适合今天先拆爆款结构，再决定自己的表达版本。',
    tone: 'bg-slate-100 text-slate-600',
  },
  {
    index: '03',
    title: '高涨粉榜 · 强观点开场 + 具体案例组合仍有效',
    meta: '优势：更适合用来判断今天要不要先做强粉向内容。',
    tone: 'bg-amber-100 text-amber-700',
  },
];

export const readingItems = [
  {
    no: '02',
    title: '拆解百万博主 Dan Koe 爆文创作系统',
    desc: '适合拆爆文结构和复用段落框架。',
    meta: '12 min 阅读 · 爆文拆解',
    tone: 'bg-fuchsia-100 text-fuchsia-700',
  },
  {
    no: '03',
    title: '如何用 AI 做出高价值内容',
    desc: '适合今天直接带着工具做实验。',
    meta: '10 min 阅读 · 工具实验',
    tone: 'bg-indigo-100 text-indigo-700',
  },
  {
    no: '04',
    title: '如何用 AI 做出内容产品',
    desc: '把内容、产品和变现视角放在一起看。',
    meta: '14 min 阅读 · 内容产品',
    tone: 'bg-teal-100 text-teal-700',
  },
];

export const articleCards = [
  '观点型版本：适合强化你在这个话题上的判断与立场。',
  '案例型版本：适合拆具体方法，便于继续精修和发布。',
  '轻口语版本：更适合朋友圈与私域语境，表达更松弛。',
];

export const titleOptions = [
  '为什么很多人越努力做内容，结果却越一般？',
  '做内容真正拉开差距的，不是勤奋，而是结构',
  '先别急着更努力，你可能只是写作方向错了',
];

export const momentsVariants = ['价值表达', '口语表达', '转化收口'];
