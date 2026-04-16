'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

type PageKey =
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

type NavGroup = {
  title: string;
  items: { key: PageKey; label: string; tag: string }[];
};

type StepTone = {
  pageBg: string;
  pageBgTop: string;
  heroStart: string;
  heroEnd: string;
  orb: string;
  chipBg: string;
  chipText: string;
  accent: string;
};

const navGroups: NavGroup[] = [
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

const workflowTones: Record<
  | 'start'
  | 'keywords'
  | 'ideas'
  | 'profile'
  | 'topics'
  | 'articles'
  | 'detail',
  StepTone
> = {
  start: {
    pageBg: '#F6F7FE',
    pageBgTop: '#F7FAFF',
    heroStart: '#1D4ED8',
    heroEnd: '#4F46E5',
    orb: '#FFFFFF20',
    chipBg: '#E8EDFF',
    chipText: '#3151D7',
    accent: '#3250D9',
  },
  keywords: {
    pageBg: '#EEF4FF',
    pageBgTop: '#F4F7FF',
    heroStart: '#1D4ED8',
    heroEnd: '#2563EB',
    orb: '#FFFFFF24',
    chipBg: '#E7EFFF',
    chipText: '#3151D7',
    accent: '#3151D7',
  },
  ideas: {
    pageBg: '#EBF7FF',
    pageBgTop: '#F2FBFA',
    heroStart: '#0F766E',
    heroEnd: '#0EA5A4',
    orb: '#CCFBF133',
    chipBg: '#DCFCE7',
    chipText: '#0F766E',
    accent: '#0F766E',
  },
  profile: {
    pageBg: '#FFF2E7',
    pageBgTop: '#FFF8F1',
    heroStart: '#C2410C',
    heroEnd: '#EA580C',
    orb: '#FFF0E744',
    chipBg: '#FFF1E8',
    chipText: '#C2410C',
    accent: '#C2410C',
  },
  topics: {
    pageBg: '#EEF2FF',
    pageBgTop: '#F5F7FF',
    heroStart: '#243BCE',
    heroEnd: '#3858F2',
    orb: '#CBD7FF33',
    chipBg: '#EEF2FF',
    chipText: '#243BCE',
    accent: '#243BCE',
  },
  articles: {
    pageBg: '#EEF3FF',
    pageBgTop: '#F4F7FF',
    heroStart: '#1E40AF',
    heroEnd: '#3157D5',
    orb: '#D5DEFF30',
    chipBg: '#E9F0FF',
    chipText: '#2442AE',
    accent: '#2442AE',
  },
  detail: {
    pageBg: '#F1F5FF',
    pageBgTop: '#F5F7FF',
    heroStart: '#2741C8',
    heroEnd: '#4F5EF0',
    orb: '#C7D5FF33',
    chipBg: '#EEF2FF',
    chipText: '#243BCE',
    accent: '#243BCE',
  },
};

const rankingRows = [
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

const readingItems = [
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

const articleCards = [
  '观点型版本：适合强化你在这个话题上的判断与立场。',
  '案例型版本：适合拆具体方法，便于继续精修和发布。',
  '轻口语版本：更适合朋友圈与私域语境，表达更松弛。',
];

const titleOptions = [
  '为什么很多人越努力做内容，结果却越一般？',
  '做内容真正拉开差距的，不是勤奋，而是结构',
  '先别急着更努力，你可能只是写作方向错了',
];

const momentsVariants = [
  '价值表达',
  '口语表达',
  '转化收口',
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function PhoneFrame({
  children,
  background,
}: {
  children: ReactNode;
  background: string;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[390px] overflow-hidden rounded-[34px] border border-white/60 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
      style={{ background }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8 bg-gradient-to-b from-black/5 to-transparent" />
      {children}
    </div>
  );
}

function FloatingLabel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute left-3 top-3 z-20 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold tracking-[0.02em] text-white">
      {children}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  soft = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  soft?: boolean;
}) {
  return (
    <section
      className={cn(
        'rounded-[22px] border p-4',
        soft ? 'border-slate-200 bg-slate-50/90' : 'border-slate-200/80 bg-white/90',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-[11px] font-medium text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn('rounded-full px-3 py-1 text-[11px] font-bold', className)}>{children}</span>;
}

function ButtonRow({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <div className="mt-auto flex gap-3">
      <button
        type="button"
        className="h-11 flex-1 rounded-full border border-slate-300 bg-white text-[14px] font-semibold text-slate-700"
      >
        {secondary}
      </button>
      <button
        type="button"
        className="h-11 flex-1 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(79,70,229,0.28)]"
      >
        {primary}
      </button>
    </div>
  );
}

function WorkflowPage({
  label,
  title,
  intro,
  tone,
  children,
  footerPrimary = '继续下一步',
  footerSecondary = '返回工作流',
}: {
  label: string;
  title: string;
  intro: string;
  tone: StepTone;
  children: ReactNode;
  footerPrimary?: string;
  footerSecondary?: string;
}) {
  return (
    <PhoneFrame
      background={`linear-gradient(180deg, ${tone.pageBgTop} 0%, ${tone.pageBg} 100%)`}
    >
      <div className="relative flex min-h-[844px] flex-col px-5 pb-5 pt-2 font-[Inter,sans-serif] text-slate-900">
        <div
          className="pointer-events-none absolute right-[-12px] top-20 h-[160px] w-[160px] rounded-full blur-xl"
          style={{ background: tone.orb }}
        />
        <FloatingLabel>{label}</FloatingLabel>
        <div className="mt-8 flex flex-1 flex-col gap-4">
          <section
            className="rounded-[28px] border border-white/20 p-5 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]"
            style={{ background: `linear-gradient(135deg, ${tone.heroStart} 0%, ${tone.heroEnd} 100%)` }}
          >
            <p className="text-[12px] font-semibold text-white/80">Workflow</p>
            <h1 className="mt-1 text-[24px] font-bold leading-[1.15]">{title}</h1>
            <p className="mt-2 text-[13px] leading-[1.45] text-white/85">{intro}</p>
          </section>

          {children}

          <ButtonRow primary={footerPrimary} secondary={footerSecondary} />
        </div>
      </div>
    </PhoneFrame>
  );
}

function TodayRankingDetailPage() {
  return (
    <PhoneFrame background="linear-gradient(180deg, #F7F8FF 0%, #EEF3FF 100%)">
      <div className="relative flex min-h-[844px] flex-col gap-3 px-5 pb-4 pt-[10px] font-[Geist,sans-serif] text-slate-900">
        <FloatingLabel>16 今日榜单 / 榜单详情</FloatingLabel>

        <section className="mt-8 rounded-[24px] bg-[linear-gradient(135deg,#1F3FD8_0%,#5668FF_62%,#8B5CF6_100%)] p-[18px] text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)]">
          <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.08em] text-[#DBE5FF]">TODAY RANKING</p>
          <h1 className="mt-2 text-[22px] font-bold leading-[1.18]">追踪今天最值得跟进的热点、低粉爆款和涨粉方向</h1>
          <p className="mt-2 text-[13px] leading-[1.42] text-[#E9EEFF]">
            从实时热度、互动表现和转化潜力三个维度，帮助你决定今天先拆哪一类内容。
          </p>
        </section>

        <div className="grid grid-cols-3 gap-2">
          {[
            ['24h', '热度刷新'],
            ['03', '榜单分类'],
            ['实时', '更新状态'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-[18px] bg-white/90 px-3 py-3 shadow-sm">
              <div className="text-[24px] font-bold text-slate-900">{value}</div>
              <div className="text-[11px] font-semibold text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <SectionCard title="榜单筛选" subtitle="按热度切换">
          <div className="flex flex-wrap gap-2">
            <Pill className="bg-indigo-600 text-white">热点榜</Pill>
            <Pill className="bg-slate-100 text-slate-600">低粉爆款</Pill>
            <Pill className="bg-slate-100 text-slate-600">高涨粉榜</Pill>
          </div>
        </SectionCard>

        <SectionCard title="热点榜单 TOP 5" subtitle="右侧滑动查看更多">
          <div className="space-y-2">
            {rankingRows.map((item) => (
              <article key={item.index} className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="flex gap-3">
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold', item.tone)}>
                    {item.index}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-bold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-[11px] leading-[1.45] text-slate-500">{item.meta}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="榜单使用建议" subtitle="先判断，再拆解" soft>
          <p className="text-[11px] font-semibold leading-[1.5] text-slate-600">
            建议先看热度最高的 1 条，再对比低粉爆款与高涨粉方向。这样能更快判断今天该先做趋势跟进、拆解模仿，还是直接输出自己的观点内容。
          </p>
        </SectionCard>

        <ButtonRow primary="查看完整榜单" secondary="返回首页" />
      </div>
    </PhoneFrame>
  );
}

function ReadingListDetailPage() {
  return (
    <PhoneFrame background="linear-gradient(180deg, #FAFAFF 0%, #F2F5FF 100%)">
      <div className="relative flex min-h-[844px] flex-col gap-3 px-5 pb-[10px] pt-2 font-[Geist,sans-serif] text-slate-900">
        <FloatingLabel>17 自媒体前沿创作集 / 详情页</FloatingLabel>

        <section className="mt-8 rounded-[24px] bg-[linear-gradient(135deg,#0F172A_0%,#1E1B4B_58%,#312E81_100%)] p-[14px] text-white shadow-[0_20px_44px_rgba(15,23,42,0.32)]">
          <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.08em] text-[#C4B5FD]">
            CREATOR READING LIST
          </p>
          <h1 className="mt-2 text-[21px] font-bold leading-[1.16]">自媒体前沿创作集</h1>
          <p className="mt-1 text-[11px] leading-[1.4] text-[#DDD6FE]">
            把值得反复研究的创作方法整理成一份今日精选，方便你判断先看什么、再拆什么、最后怎么模仿。
          </p>
          <div className="mt-3 flex gap-2">
            <Pill className="bg-white/15 text-white">6 篇精选</Pill>
            <Pill className="bg-white/10 text-[#DDD6FE]">今日已收录</Pill>
          </div>
        </section>

        <section className="rounded-[20px] bg-[linear-gradient(135deg,#161B33_0%,#243B53_100%)] p-[10px] text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold">本周推荐</h3>
            <span className="text-[11px] font-semibold text-white/60">建议先读</span>
          </div>
          <article className="mt-2 rounded-[18px] bg-white/10 p-3">
            <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#C4B5FD]">创作系统</p>
            <h4 className="mt-1 text-[13px] font-bold">油管大神 Dan Koe：一人公司内容路径</h4>
            <p className="mt-1 text-[11px] leading-[1.45] text-white/75">
              先研究爆文结构和复述方式，再回到自己的主题写一版模仿稿。
            </p>
          </article>
        </section>

        <div className="flex flex-wrap gap-2">
          {['内容模型', '案例拆解', '创作方法', '一人公司'].map((item, index) => (
            <Pill
              key={item}
              className={
                index === 1 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 shadow-sm'
              }
            >
              {item}
            </Pill>
          ))}
        </div>

        <SectionCard title="继续阅读" subtitle="滑动可看更多">
          <div className="space-y-2">
            {readingItems.map((item) => (
              <article key={item.no} className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="flex gap-3">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold', item.tone)}>
                    {item.no}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[14px] font-bold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-[12px] font-semibold text-slate-500">{item.desc}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-indigo-600">
                        {item.meta}
                      </span>
                      <span className="text-[12px] font-bold text-slate-400">查看</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <ButtonRow primary="打开完整合集" secondary="返回首页" />
      </div>
    </PhoneFrame>
  );
}

function CopywriterStartPage() {
  const tone = workflowTones.start;

  return (
    <WorkflowPage
      label="05 文案开始页"
      title="开始一轮新的自媒体创作工作流"
      intro="先确认这次要做的是哪类内容，再进入关键词、想法和资料完善流程。"
      tone={tone}
      footerPrimary="开始创作"
      footerSecondary="回到工作流"
    >
      <SectionCard title="这次你将完成什么" subtitle="从想法到文案版本">
        <div className="grid grid-cols-2 gap-2">
          {['确认关键词', '补充想法', '完善资料', '选择选题'].map((item) => (
            <div key={item} className="rounded-2xl bg-indigo-50 px-3 py-3 text-[12px] font-bold text-indigo-700">
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="工作流预览" subtitle="预计 5-10 分钟">
        <div className="space-y-2">
          {[
            '05 文案开始页',
            '06 关键词输入',
            '07 想法补充',
            '08 资料完善',
            '09 选题选择',
            '10 文案版本',
            '11 文案详情',
          ].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                {index + 1}
              </div>
              <p className="text-[12px] font-semibold text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="开始前提示" subtitle="有助于生成质量">
        <p className="text-[12px] font-semibold leading-[1.5] text-slate-600">
          如果你已经有关键词、选题方向或目标受众，后面的页面会更容易产出稳定结果。
        </p>
      </SectionCard>
    </WorkflowPage>
  );
}

function CopywriterKeywordsPage() {
  const tone = workflowTones.keywords;

  return (
    <WorkflowPage
      label="06 关键词输入"
      title="先输入这次要写的核心关键词"
      intro="关键词决定后面的方向提炼和版本生成，是这条流程的入口变量。"
      tone={tone}
    >
      <SectionCard title="关键词输入区" subtitle="至少 3 个，建议 5-8 个">
        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[13px] font-bold text-slate-900">AI 写作、自媒体、内容结构、表达方式、观点输出</p>
        </div>
      </SectionCard>

      <SectionCard title="系统提示" subtitle="便于你快速上手" soft>
        <p className="text-[12px] font-semibold leading-[1.5] text-slate-600">
          关键词越具体，后续“想法补充”和“资料完善”阶段越容易收敛出有判断力的表达方向。
        </p>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        {['内容增长', '创业 IP', '副业表达'].map((item) => (
          <Pill key={item} className="bg-white text-slate-600 shadow-sm">
            {item}
          </Pill>
        ))}
      </div>
    </WorkflowPage>
  );
}

function CopywriterIdeasPage() {
  const tone = workflowTones.ideas;

  return (
    <WorkflowPage
      label="07 想法补充"
      title="补充你真正想表达的判断、观点和例子"
      intro="这一步不是堆素材，而是告诉系统：这次想把什么说清楚。"
      tone={tone}
    >
      <SectionCard title="想法输入" subtitle="先说判断，再给例子">
        <div className="space-y-2">
          {[
            '很多人做内容的问题不是不努力，而是方向和结构没先理顺。',
            '想写出“为什么越努力越拧巴”的判断感。',
            '可以补一个 Dan Koe 或一人公司创作者的案例。',
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-teal-50 px-3 py-3 text-[12px] font-semibold text-teal-800">
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="系统建议" subtitle="更像在搭观点骨架">
        <p className="text-[12px] font-semibold leading-[1.5] text-slate-600">
          如果你能给出“为什么”“怎么判断”“举什么例子”，后续系统产出的版本会更有作者感，而不是空泛套话。
        </p>
      </SectionCard>
    </WorkflowPage>
  );
}

function CopywriterProfilePage() {
  const tone = workflowTones.profile;

  return (
    <WorkflowPage
      label="08 资料完善"
      title="补充用户画像、价值主张和 IP 信息"
      intro="让系统知道你是为谁写、想建立什么印象、准备往哪里转化。"
      tone={tone}
    >
      <SectionCard title="用户画像" subtitle="这篇内容主要说给谁听">
        <div className="rounded-2xl bg-orange-50 px-4 py-4 text-[12px] font-semibold text-orange-900">
          面向刚开始做内容的个体创作者，常见问题是想法很多但表达散、写作节奏不稳定。
        </div>
      </SectionCard>

      <SectionCard title="价值主张" subtitle="你希望别人记住什么">
        <div className="rounded-2xl bg-orange-50 px-4 py-4 text-[12px] font-semibold text-orange-900">
          帮用户把内容策略、表达结构和产品意识放到一个更稳的工作流里。
        </div>
      </SectionCard>

      <SectionCard title="IP 资料" subtitle="补足你的身份与方法论">
        <div className="flex flex-wrap gap-2">
          {['内容策略', '产品思维', '个人品牌', '方法拆解'].map((item) => (
            <Pill key={item} className="bg-white text-orange-700 shadow-sm">
              {item}
            </Pill>
          ))}
        </div>
      </SectionCard>
    </WorkflowPage>
  );
}

function CopywriterTopicsPage() {
  const tone = workflowTones.topics;

  return (
    <WorkflowPage
      label="09 选题选择"
      title="系统已经整理出几个可继续写下去的方向"
      intro="你现在只需要判断今天更适合做趋势跟进、观点内容，还是案例拆解。"
      tone={tone}
    >
      <SectionCard title="候选选题" subtitle="选择一个继续产出">
        <div className="space-y-2">
          {[
            '不是你不努力，是很多人写内容之前没有先做结构校准',
            '为什么强观点开场仍然是低粉创作者最快起量的方法',
            '把内容当产品做：一条爆文背后的表达结构是什么',
          ].map((item, index) => (
            <div
              key={item}
              className={cn(
                'rounded-2xl px-4 py-3 text-[12px] font-semibold',
                index === 2 ? 'border border-indigo-300 bg-indigo-50 text-indigo-800' : 'bg-white text-slate-700',
              )}
            >
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="提示" subtitle="先选最容易继续写的" soft>
        <p className="text-[12px] font-semibold leading-[1.5] text-slate-600">
          如果你今天时间有限，先选你已经有真实判断或案例支撑的那条，会比追求“最炸”的标题更稳。
        </p>
      </SectionCard>
    </WorkflowPage>
  );
}

function CopywriterArticlesPage() {
  const tone = workflowTones.articles;

  return (
    <WorkflowPage
      label="10 文案版本"
      title="系统生成了 3 个可继续打磨的文案版本"
      intro="你可以先挑一版最接近自己语气的，再进入详情页做精修。"
      tone={tone}
      footerPrimary="进入详情页"
      footerSecondary="返回选题"
    >
      <div className="rounded-full bg-indigo-50 px-4 py-2 text-center text-[12px] font-bold text-indigo-700">
        正在根据选题与资料生成版本
      </div>

      <SectionCard title="版本候选" subtitle="先挑表达方向">
        <div className="space-y-2">
          {articleCards.map((item) => (
            <article key={item} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-[13px] font-semibold leading-[1.5] text-slate-700">{item}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </WorkflowPage>
  );
}

function CopywriterDetailPage() {
  const tone = workflowTones.detail;

  return (
    <WorkflowPage
      label="11 文案详情"
      title="继续精修当前版本，让它更像你会发布的内容"
      intro="这里适合调整标题、正文结构、表达方式和结尾收口。"
      tone={tone}
      footerPrimary="保存并使用"
      footerSecondary="返回版本页"
    >
      <SectionCard title="当前标题" subtitle="可继续微调">
        <h3 className="text-[16px] font-bold leading-[1.35] text-slate-900">
          不是你不够努力，而是很多人一开始就把内容做反了
        </h3>
      </SectionCard>

      <SectionCard title="正文内容" subtitle="可复制、可继续润色">
        <p className="text-[13px] leading-[1.65] text-slate-700">
          很多人做内容时，最先补的都是努力。但真实情况往往是：方向错了、结构乱了、表达方式没调顺时，越努力，只会越拧巴。先把判断讲清楚，把结构搭稳，再去追求更新频率，内容才会开始真正长出来。
        </p>
      </SectionCard>

      <SectionCard title="辅助建议" subtitle="可作为下一步优化方向" soft>
        <div className="space-y-2 text-[12px] font-semibold text-slate-600">
          <p>1. 开头可以更快抛判断，减少铺垫。</p>
          <p>2. 中段补一个案例，会比抽象说理更有说服力。</p>
          <p>3. 结尾可以加入更明确的行动导向或收口句。</p>
        </div>
      </SectionCard>
    </WorkflowPage>
  );
}

function TitleGeneratePage() {
  return (
    <PhoneFrame background="linear-gradient(180deg, #F6F7FE 0%, #EEF2FF 100%)">
      <div className="relative flex min-h-[844px] flex-col gap-[10px] px-5 pb-3 pt-2 font-[Inter,sans-serif] text-slate-900">
        <div className="pointer-events-none absolute right-0 top-24 h-[150px] w-[150px] rounded-full bg-[#D7DFFF33] blur-xl" />
        <FloatingLabel>12 标题生成</FloatingLabel>

        <section className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#243BCE_0%,#5A4CFF_100%)] p-[18px] text-white">
          <p className="text-[12px] font-semibold text-white/80">Title Creator</p>
          <h1 className="mt-1 text-[24px] font-bold leading-[1.15]">从当前选题里直接生成一组可发布标题</h1>
          <p className="mt-2 text-[13px] leading-[1.45] text-white/85">
            适合快速探索不同表达角度，再从中挑一版继续打磨。
          </p>
        </section>

        <SectionCard title="当前选题" subtitle="作为标题生成依据">
          <p className="text-[13px] font-semibold leading-[1.5] text-slate-700">
            不是你不努力，而是很多人做内容之前没有先做结构校准。
          </p>
        </SectionCard>

        <SectionCard title="风格偏好" subtitle="可以切换表达语气">
          <div className="flex flex-wrap gap-2">
            {['强观点', '解释型', '问题切入', '对比反差'].map((item, index) => (
              <Pill key={item} className={index === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}>
                {item}
              </Pill>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="标题预览" subtitle="建议先挑方向再细改">
          <div className="space-y-2">
            {titleOptions.map((item) => (
              <article key={item} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="text-[13px] font-bold leading-[1.5] text-slate-800">{item}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <ButtonRow primary="生成下一组" secondary="返回工作流" />
      </div>
    </PhoneFrame>
  );
}

function TitleLibraryPage() {
  return (
    <PhoneFrame background="linear-gradient(180deg, #F6F7FE 0%, #EEF2FF 100%)">
      <div className="relative flex min-h-[844px] flex-col gap-[10px] px-5 pb-[10px] pt-2 font-[Inter,sans-serif] text-slate-900">
        <div className="pointer-events-none absolute right-0 top-24 h-[150px] w-[150px] rounded-full bg-[#D7DFFF33] blur-xl" />
        <FloatingLabel>13 标题备选库</FloatingLabel>

        <section className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#243BCE_0%,#5A4CFF_100%)] p-[14px] text-white">
          <p className="text-[12px] font-semibold text-white/80">Candidate Library</p>
          <h1 className="mt-1 text-[23px] font-bold leading-[1.14]">把候选标题放进一个可继续筛选的备选库</h1>
          <p className="mt-2 text-[12px] leading-[1.45] text-white/85">方便你对比不同表达方式后，再决定最终采用哪一个。</p>
        </section>

        <SectionCard title="筛选条件" subtitle="按风格或强度查看">
          <div className="flex flex-wrap gap-2">
            {['全部', '强观点', '对比型', '解释型'].map((item, index) => (
              <Pill key={item} className={index === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}>
                {item}
              </Pill>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="备选标题" subtitle="点击即可继续精修">
          <div className="space-y-2">
            {[
              ...titleOptions,
              '很多人做内容起不来，不是因为不努力，而是表达结构没搭对',
            ].map((item) => (
              <article key={item} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-[13px] font-semibold leading-[1.5] text-slate-800">{item}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="最终选定方向" subtitle="当前推荐" soft>
          <p className="text-[13px] font-bold text-slate-800">为什么很多人越努力做内容，结果却越一般？</p>
        </SectionCard>

        <ButtonRow primary="采用当前标题" secondary="返回生成页" />
      </div>
    </PhoneFrame>
  );
}

function MomentsGeneratePage() {
  return (
    <PhoneFrame background="linear-gradient(180deg, #F7FAFF 0%, #EEF4FF 100%)">
      <div className="relative flex min-h-[844px] flex-col gap-3 px-5 pb-[18px] pt-3 font-[Inter,sans-serif] text-slate-900">
        <FloatingLabel>14 朋友圈文案生成</FloatingLabel>

        <section className="rounded-[26px] border border-white/20 bg-[linear-gradient(135deg,#1847D8_0%,#4263EB_58%,#16A3B7_100%)] p-4 text-white">
          <p className="text-[12px] font-semibold text-[#DDEBFF]">朋友圈文案</p>
          <h1 className="mt-1 text-[20px] font-bold leading-[1.18]">基于现有内容，快速生成更适合朋友圈发布的表达版本</h1>
          <p className="mt-2 text-[12px] leading-[1.45] text-[#E6F4FF]">
            自动提炼卖点、调整口语感、补足转化收口，输出可直接发布的文案草稿。
          </p>
        </section>

        <SectionCard title="原始内容" subtitle="作为朋友圈版本的输入">
          <p className="text-[14px] leading-[1.55] text-slate-700">
            很多人以为，只要更努力地写，就会慢慢找到自己的节奏。但真实情况往往是：当你没有先解决方向和结构问题时，越努力，只会越拧巴。
          </p>
        </SectionCard>

        <SectionCard title="改写方向" subtitle="先确定你要哪种表达语气">
          <div className="space-y-2">
            {momentsVariants.map((item) => (
              <div key={item} className="rounded-2xl bg-cyan-50 px-4 py-3 text-[13px] font-semibold text-cyan-800">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="补充策略" subtitle="决定收口方式" soft>
          <p className="text-[12px] font-semibold leading-[1.5] text-slate-600">
            可以强调观点、增加口语化表达，或者在结尾补一个更明确的行动引导。
          </p>
        </SectionCard>

        <ButtonRow primary="开始生成" secondary="返回工作流" />
      </div>
    </PhoneFrame>
  );
}

function MomentsRefinePage() {
  return (
    <PhoneFrame background="linear-gradient(180deg, #F6F7FE 0%, #EEF2FF 100%)">
      <div className="relative flex min-h-[844px] flex-col gap-2 px-[14px] pb-3 pt-[6px] font-[Inter,sans-serif] text-slate-900">
        <FloatingLabel>15 朋友圈文案精修</FloatingLabel>

        <section className="rounded-[26px] border border-white/20 bg-[linear-gradient(135deg,#243BCE_0%,#5A4CFF_100%)] px-3 py-[10px] text-white">
          <p className="text-[12px] font-semibold text-[#DDE6FF]">朋友圈文案精修</p>
          <h1 className="mt-1 text-[20px] font-bold leading-[1.18]">把生成结果改得更像你真的会发出去的一条朋友圈</h1>
          <p className="mt-2 text-[12px] leading-[1.45] text-white/85">
            支持切换版本、快速重生成，并将满意文案带回创作流程。
          </p>
        </section>

        <SectionCard title="预览结果" subtitle="当前 3 个版本可切换">
          <div className="space-y-2">
            {[
              '很多人做内容时，最先补的都是努力，但真正决定结果的，往往是方向、结构和表达方式。先把底层问题校准，内容才会开始长出来。',
              '不是你不够努力，而是很多时候内容迟迟起不来，本质上是方向、结构和表达方式还没有被调顺。',
            ].map((item, index) => (
              <article
                key={item}
                className={cn(
                  'rounded-2xl px-4 py-3 text-[13px] leading-[1.5]',
                  index === 0 ? 'bg-indigo-50 text-slate-800' : 'border border-slate-200 bg-white text-slate-700',
                )}
              >
                {item}
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="编辑区" subtitle="继续微调用词与收口">
          <p className="text-[12px] font-semibold leading-[1.6] text-slate-600">
            可以把“方向、结构、表达方式”替换成更口语化的说法，再补一个更明确的结尾。
          </p>
        </SectionCard>

        <ButtonRow primary="加入创作页" secondary="返回生成页" />
      </div>
    </PhoneFrame>
  );
}

function renderPage(page: PageKey) {
  switch (page) {
    case 'today-ranking-detail':
      return <TodayRankingDetailPage />;
    case 'reading-list-detail':
      return <ReadingListDetailPage />;
    case 'copywriter-start':
      return <CopywriterStartPage />;
    case 'copywriter-keywords':
      return <CopywriterKeywordsPage />;
    case 'copywriter-ideas':
      return <CopywriterIdeasPage />;
    case 'copywriter-profile':
      return <CopywriterProfilePage />;
    case 'copywriter-topics':
      return <CopywriterTopicsPage />;
    case 'copywriter-articles':
      return <CopywriterArticlesPage />;
    case 'copywriter-detail':
      return <CopywriterDetailPage />;
    case 'title-generate':
      return <TitleGeneratePage />;
    case 'title-library':
      return <TitleLibraryPage />;
    case 'moments-generate':
      return <MomentsGeneratePage />;
    case 'moments-refine':
      return <MomentsRefinePage />;
    default:
      return null;
  }
}

export default function SelectedFramesShowcase() {
  const [activePage, setActivePage] = useState<PageKey>('today-ranking-detail');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef2ff_0%,#f8fafc_42%,#ffffff_100%)] px-6 py-8 text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="font-['IBM_Plex_Mono',monospace] text-[11px] tracking-[0.16em] text-indigo-600">
              PENCIL TO NEXT
            </p>
            <h1 className="mt-2 text-[28px] font-bold leading-[1.05]">Selected Frames Showcase</h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-slate-600">
              React + Tailwind + Next.js version of the currently selected Pencil frames. The output focuses on structure,
              typography hierarchy, gradients, and mobile page rhythm.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {navGroups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {group.title}
                </h2>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActivePage(item.key)}
                      className={cn(
                        'w-full rounded-2xl border px-4 py-3 text-left transition',
                        activePage === item.key
                          ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                      )}
                    >
                      <div className="text-[13px] font-bold text-slate-900">{item.label}</div>
                      <div className="mt-1 text-[11px] font-semibold text-slate-500">{item.tag}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="rounded-[32px] border border-white/60 bg-white/40 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur">
          {renderPage(activePage)}
        </main>
      </div>
    </div>
  );
}
