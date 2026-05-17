import React from "react";

type ScreenProps = {
  label: string;
  title: string;
  children: React.ReactNode;
  theme?: "blue" | "teal" | "orange" | "navy";
};

const themeMap = {
  blue: "from-blue-700 via-indigo-600 to-blue-500",
  teal: "from-teal-700 via-cyan-600 to-teal-500",
  orange: "from-orange-700 via-orange-600 to-orange-500",
  navy: "from-slate-900 via-indigo-950 to-slate-800",
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function ScreenFrame({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="w-[390px] overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#f8f8ff_0%,#f2f5ff_60%,#eef2ff_100%)] p-3 shadow-[0_24px_70px_rgba(44,62,120,0.16)]">
      <div className="mb-3 inline-flex rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-white">
        {label}
      </div>
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">{title}</div>
        {children}
      </div>
    </section>
  );
}

function HeroCard({ label, title, body, theme = "blue" }: ScreenProps) {
  return (
    <div className={cn("rounded-[28px] bg-gradient-to-br p-6 text-white shadow-[0_20px_50px_rgba(53,76,170,0.28)]", themeMap[theme])}>
      <div className="text-xs font-semibold text-white/80">{label}</div>
      <div className="mt-2 text-[32px] font-bold leading-[1.12]">{title}</div>
      <p className="mt-4 text-sm leading-6 text-white/85">{body}</p>
    </div>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-indigo-500 px-6 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(63,91,255,0.3)]">
      {children}
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700">
      {children}
    </button>
  );
}

function Card({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div className={cn("rounded-[24px] border p-4", muted ? "border-slate-200 bg-slate-50/90" : "border-slate-100 bg-white")}>
      {children}
    </div>
  );
}

function Pills({ items, active = 0, tone = "indigo" }: { items: string[]; active?: number; tone?: "indigo" | "teal" | "blue" }) {
  const activeClass =
    tone === "teal"
      ? "bg-teal-500 text-white"
      : tone === "blue"
        ? "bg-blue-500 text-white"
        : "bg-indigo-500 text-white";

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, index) => (
        <div
          key={item}
          className={cn(
            "rounded-2xl border px-3 py-2 text-center text-sm font-semibold",
            index === active ? activeClass : "border-slate-200 bg-white text-slate-600",
          )}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function TimelineStep({
  index,
  title,
  desc,
  tone,
}: {
  index: string;
  title: string;
  desc: string;
  tone: "blue" | "violet" | "green" | "amber" | "sky";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
  }[tone];

  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-slate-100 bg-white px-4 py-3">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold", toneClass)}>{index}</div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">{desc}</div>
      </div>
    </div>
  );
}

function CopywriterStartScreen() {
  return (
    <ScreenFrame label="05 文案开始页" title="Copywriter / Start">
      <HeroCard
        label="开始文案创作"
        title="开始文案创作"
        body="6 步完成一轮文案创作，可随时返回修改。"
      />
      <Card>
        <div className="text-lg font-bold text-slate-900">创作流程</div>
        <p className="mt-1 text-sm leading-6 text-slate-500">从关键词到成稿，纵向 6 步主流程放在中间，下方保留行动入口。</p>
        <div className="mt-4 space-y-2">
          <TimelineStep index="01" title="收集关键词" desc="观察点、产品词、问题先写进来。" tone="blue" />
          <TimelineStep index="02" title="补充灵感" desc="你的观点、感受和切入角度。" tone="violet" />
          <TimelineStep index="03" title="明确人群" desc="补齐价值、IP 和目标人群。" tone="green" />
          <TimelineStep index="04" title="生成选题" desc="挑出 5 个可继续写下去的方向。" tone="amber" />
          <TimelineStep index="05" title="扩写成稿" desc="从选题进入正文，生成初稿。" tone="sky" />
        </div>
      </Card>
      <Card muted>
        <div className="text-base font-semibold text-slate-900">开始前准备</div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
          <div className="rounded-2xl bg-blue-50 px-3 py-3 text-blue-700">关键词</div>
          <div className="rounded-2xl bg-violet-50 px-3 py-3 text-violet-700">想法</div>
          <div className="rounded-2xl bg-emerald-50 px-3 py-3 text-emerald-700">知识库</div>
        </div>
      </Card>
      <PrimaryButton>开始文案创作</PrimaryButton>
    </ScreenFrame>
  );
}

function KeywordsScreen() {
  return (
    <ScreenFrame label="06 关键词输入" title="Copywriter / Step1 Keywords">
      <HeroCard
        label="STEP 1 · 关键词 / 热点"
        title="把你眼前最想写的内容先丢进来"
        body="支持逗号、换行、热词、标题碎片。先输入，再慢慢整理。"
      />
      <Card>
        <div className="min-h-[320px] whitespace-pre-line text-lg leading-10 text-slate-700">
          副业赚钱{"\n"}小红书起号{"\n"}为什么普通人做内容总是坚持不下去
        </div>
      </Card>
      <div className="rounded-full bg-blue-100 px-5 py-4 text-center text-sm font-semibold text-blue-700">请至少输入 1 个关键词或热点信息</div>
      <div className="flex gap-3">
        <SecondaryButton>填入示例</SecondaryButton>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>跳过这步</SecondaryButton>
        <PrimaryButton>填充灵感</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function IdeasScreen() {
  return (
    <ScreenFrame label="07 想法补充" title="Copywriter / Step2 Ideas">
      <HeroCard
        label="STEP 2 · 灵感 / 想法 / 点子"
        title="补充你真正想表达的观点和角度"
        body="输入你的灵感、你想表达的想法，让后面的选题更更像你。"
        theme="teal"
      />
      <Card>
        <div className="min-h-[330px] text-lg leading-10 text-slate-700">
          我想写普通人做内容时最容易累积的坑，以及为什么总是卡在持续输出这一步。
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>上一步</SecondaryButton>
        <PrimaryButton>完善创作信息</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function ProfileScreen() {
  return (
    <ScreenFrame label="08 资料完善" title="Copywriter / Step3 Profile">
      <HeroCard
        label="STEP 3 · 写给谁 / 有价值 / 你是谁"
        title="把知识库里的核心约束补全"
        body="目标人群、价值和 IP 背书，会直接决定后面的选题质量。"
        theme="orange"
      />
      <Card>
        <div className="mb-2 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">目标人群</div>
        <div className="text-base font-semibold text-slate-700">副业新手 · 宝妈 · 职场 3-5 年</div>
      </Card>
      <Card muted>
        <div className="mb-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">价值</div>
        <p className="text-sm leading-6 text-slate-600">
          帮你在更短时间内做到更稳定的结果。避开最容易浪费时间的 3 个坑，用更具体的方法解决卡住行动的问题。
        </p>
      </Card>
      <Card muted>
        <div className="mb-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">IP</div>
        <p className="text-sm leading-6 text-slate-600">我是做过 3 年内容增长的产品运营，偏理性拆解和实操派风格。</p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>上一步</SecondaryButton>
        <PrimaryButton>生成 5 个选题</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function TopicsScreen() {
  return (
    <ScreenFrame label="09 选题选择" title="Copywriter / Step4 Topics">
      <HeroCard
        label="STEP 4 · 选题生成"
        title="先选一个你最想写的方向"
        body="已基于你的创作条件生成 5 个候选选题。"
      />
      <Card muted>
        <p className="text-sm leading-6 text-slate-600">
          关键词：副业赚钱 / 小红书起号
          <br />
          灵感：我想写普通人做内容时最容易累积的坑，以及为什么总是卡在持续输出这一步。
          <br />
          知识库：副业新手 · 宝妈 · 职场 3-5 年
        </p>
      </Card>
      <Card>
        <div className="text-lg font-bold text-slate-900">副业新手做内容前，先补上的 3 个动作</div>
        <p className="mt-2 text-sm leading-6 text-slate-500">教程型 · 公众号 / 小红书</p>
        <p className="mt-1 text-sm text-slate-500">先解决方向感，再进入持续输出</p>
      </Card>
      <Card>
        <div className="text-lg font-bold text-slate-900">为什么大多数人一开始就把内容方向弄错</div>
        <p className="mt-2 text-sm leading-6 text-slate-500">观点型 · 公众号</p>
        <p className="mt-1 text-sm text-slate-500">反直觉切入，更适合立场表达</p>
      </Card>
      <Card muted>
        <div className="text-lg font-bold text-slate-900">围绕副业赚钱，这 5 个选题最容易出结果</div>
        <p className="mt-2 text-sm text-blue-600">支持编辑框架、摘要和平台建议</p>
      </Card>
      <div className="rounded-full bg-amber-100 px-5 py-3 text-center text-sm font-semibold text-amber-700">你修改过前面的创作条件，建议重新生成</div>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>返回修改条件</SecondaryButton>
        <PrimaryButton>全部重生成</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function ArticlesScreen() {
  return (
    <ScreenFrame label="10 文章列表" title="Copywriter / Step5 Articles">
      <HeroCard
        label="STEP 5 · 文章生成"
        title="副业新手做内容前，最该先补上的 3 个动作"
        body="摘要：先解决方向感，再进入持续输出"
      />
      <div className="rounded-full bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-700">正在生成第 1/3 篇……支持单篇重试</div>
      {[
        ["A", "教程步骤型｜搭出第一个稳定输出系统"],
        ["B", "观点冲突型｜为什么你越努力写越容易累"],
        ["C", "故事案例型｜我如何从断更到恢复稳定更"],
      ].map(([tag, title]) => (
        <Card key={tag}>
          <div className="text-lg font-bold text-slate-900">
            {tag} · {title}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            很多人最大的问题不是不会写，而是不知道该先写什么。先从固定选题池、固定表达结构、固定发布时间切开。
          </p>
          <div className="mt-4 flex justify-end">
            <button className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">确认</button>
          </div>
        </Card>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>换一个选题</SecondaryButton>
        <PrimaryButton>全部重新生成</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function ArticleDetailScreen() {
  return (
    <ScreenFrame label="11 文章详情" title="Copywriter / Step6 Detail">
      <Card>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">教程型</div>
        <div className="mt-2 text-[28px] font-bold leading-[1.18] text-slate-900">教程步骤型｜搭出第一个稳定输出系统</div>
      </Card>
      <Card>
        <div className="text-sm font-bold text-blue-600">正文 · 已自动保存</div>
        <div className="mt-3 space-y-4 text-sm leading-7 text-slate-700">
          <p>很多人以为，只要越努力地写，就会慢慢找到自己的节奏。但真实情况往往相反：当你没有先解决方向和结构问题时，越努力，只会越拧巴。</p>
          <p>真正让内容成立的，不只是产量，还有你写给谁、解决什么问题、你凭什么这么说。</p>
          <p>如果你的目标是稳定输出，就先搭一个最小系统：固定选题池、固定表达结构、固定发布时间。先让行动重复，再谈风格和爆款。</p>
        </div>
      </Card>
      <Card muted>
        <div className="text-base font-bold text-slate-900">AI 辅助操作</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["更口语", "更专业", "更简洁", "提炼标题"].map((item) => (
            <span key={item} className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              {item}
            </span>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>返回列表</SecondaryButton>
        <PrimaryButton>复制全文</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function TitleGenerateScreen() {
  return (
    <ScreenFrame label="12 标题生成" title="Title Creator / Generate">
      <HeroCard label="标题创作" title="围绕现有内容，快速筛出更想点开的标题" body="支持切换风格、重生成、锁定候选版本。" />
      <Card>
        <div className="text-base font-bold text-slate-900">正文</div>
        <p className="mt-3 text-sm leading-6 text-slate-600">很多人以为，只要更努力地写，就会慢慢找到自己的节奏。但真实情况往往相反：当你没有先解决方向和结构问题时，越努力，只会越拧巴。</p>
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">标题风格</div>
          <div className="text-sm font-semibold text-slate-400">可多次切换</div>
        </div>
        <Pills items={["冲突型", "数字型", "悬念型", "圈定人群", "情绪型", "方法型"]} active={0} />
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">本轮标题结果</div>
          <div className="text-sm font-semibold text-slate-400">冲突型 · 6 条</div>
        </div>
        <div className="space-y-3">
          {[
            "你不是写不出来，而是一开始就把方向做错了",
            "为什么越努力做内容的人，反而越容易写废",
            "普通人做内容前，最该先补上的其实不是努力",
          ].map((item, index) => (
            <div key={item} className={cn("rounded-[22px] border p-4", index === 0 ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white")}>
              <div className="text-base font-bold text-slate-900">{item}</div>
              <div className="mt-2 text-sm text-slate-500">{index === 0 ? "强冲突开头，适合做主标题" : "适合加入备选池反复对照"}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <SecondaryButton>换一批</SecondaryButton>
          <button className="rounded-full bg-indigo-50 px-6 py-4 text-sm font-bold text-indigo-700">添加到标题备选库</button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>返回创作页</SecondaryButton>
        <PrimaryButton>复制该标题</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function TitleLibraryScreen() {
  return (
    <ScreenFrame label="13 标题备选库" title="Title Candidate Library">
      <HeroCard label="标题备选库" title="把想保留的标题先收进这里，再集中比较和确认" body="支持按状态查看、锁定优先标题、删除不需要的版本。" />
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">筛选视图</div>
          <div className="text-sm font-semibold text-slate-400">自动按状态整理</div>
        </div>
        <Pills items={["全部 12", "已锁定 3", "待比较 5"]} active={0} />
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">我的备选标题</div>
          <div className="text-sm font-semibold text-slate-400">可继续补充</div>
        </div>
        <div className="space-y-3">
          <div className="rounded-[22px] border border-indigo-200 bg-indigo-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-bold text-slate-900">你不是写不出来，而是一开始就把方向做错了</div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600">已锁定</span>
            </div>
            <div className="mt-2 text-sm text-slate-500">适合作为本轮主标题，冲突感强，点击意图明确。</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-600">取消锁定</button>
              <button className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-red-500">删除</button>
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-bold text-slate-900">为什么越努力做内容的人，反而越容易写废</div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">待比较</span>
            </div>
            <div className="mt-2 text-sm text-slate-500">更适合做观点压场型副标题。</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-full bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-600">锁定</button>
              <button className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-600">删除</button>
            </div>
          </div>
        </div>
      </Card>
      <Card muted>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">最终选题</div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600">已确认 1 条</span>
        </div>
        <div className="text-xl font-bold text-slate-900">你不是写不出来，而是一开始就把方向做错了</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["主标题", "冲突型", "优先发布"].map((item, index) => (
            <span key={item} className={cn("rounded-full px-3 py-1 text-xs font-bold", index === 0 ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700")}>
              {item}
            </span>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-full bg-white px-4 py-3 text-sm font-bold text-indigo-600">复制标题</button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>继续添加</SecondaryButton>
        <PrimaryButton>返回创作页</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function RankingDetailScreen() {
  return (
    <ScreenFrame label="16 今日榜单 / 榜单详情" title="Ranking Detail">
      <HeroCard label="今日榜单" title="追踪今天最值得跟进的热点、低粉爆款和涨粉方向" body="从实时热度、互动表现和转化潜力三个维度，帮助你决定今天先拆哪一类内容。" />
      <div className="grid grid-cols-3 gap-3">
        {[
          ["24h", "热度刷新"],
          ["03", "榜单分类"],
          ["实时", "更新状态"],
        ].map(([value, label]) => (
          <Card key={label}>
            <div className="text-3xl font-bold text-slate-900">{value}</div>
            <div className="mt-1 text-sm text-slate-500">{label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">榜单筛选</div>
          <div className="text-sm font-semibold text-slate-400">按热度切换</div>
        </div>
        <Pills items={["热点榜单", "低粉爆款", "高涨粉榜"]} active={0} />
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">热点榜单 TOP 5</div>
          <div className="text-sm font-semibold text-slate-400">右滑动查看更多</div>
        </div>
        <div className="space-y-3">
          {[
            ["01", "抖音热点榜｜AI 副业赛道继续升温", "优势：热度高、评论活跃，适合做趋势判断与话题拆解"],
            ["02", "低粉爆款榜｜小切口案例复盘更容易起量", "优势：适合今天先拆解模仿，再做自己的表达"],
            ["03", "高涨粉榜｜强观点开场 + 具体案例组合仍有效", "优势：更适合同步平台策略调整"],
          ].map(([index, title, meta]) => (
            <div key={index} className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{index}</div>
                <div className="flex-1">
                  <div className="text-base font-bold text-slate-900">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">{meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card muted>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">榜单使用建议</div>
          <div className="text-sm font-semibold text-slate-400">先判断，再拆解</div>
        </div>
        <p className="text-sm leading-6 text-slate-600">建议先看热度最高的 1 条，再对比低粉爆款与高涨粉方向。这样能更快判断今天该先做趋势跟进、拆解模仿，还是直接输出自己的观点内容。</p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>返回首页</SecondaryButton>
        <PrimaryButton>查看完整榜单</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function ReadingListDetailScreen() {
  return (
    <ScreenFrame label="17 自媒体前沿创作集 / 详情页" title="Reading List Detail">
      <HeroCard label="自媒体前沿创作集" title="自媒体前沿创作集" body="把值得反复研究的创作方法整理成一份今日精选，方便你判断先看什么、再拆什么、最后怎么模仿。" theme="navy" />
      <div className="flex gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">6 篇精选</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">今日已收录</span>
      </div>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">本周首推</div>
          <div className="text-sm font-semibold text-slate-400">建议先读</div>
        </div>
        <div className="rounded-[22px] bg-gradient-to-r from-violet-900 to-indigo-700 p-4 text-white">
          <div className="text-xs font-semibold text-white/70">创作系统</div>
          <div className="mt-2 text-xl font-bold">油管大神 Dan Koe：一人公司内容路径</div>
          <div className="mt-3 text-sm leading-6 text-white/80">先研究爆文结构和复述方式，再回到自己的主题写一版模仿稿。</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["创作系统", "模仿拆解", "一人公司"].map((item) => (
              <span key={item} className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                {item}
              </span>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          {["内容模型", "案例拆解", "创作方法", "一人公司"].map((item, index) => (
            <span key={item} className={cn("rounded-full px-3 py-2 text-xs font-bold", index === 1 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>
              {item}
            </span>
          ))}
        </div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">继续阅读</div>
          <div className="text-sm font-semibold text-slate-400">滑动可看更多</div>
        </div>
        <div className="space-y-3">
          {[
            ["02", "拆解百万博主 Dan Koe 爆文创作系统", "适合拆爆文结构和复用段落策略"],
            ["03", "如何用 AI 做出高价值内容", "适合今天直接拿来套思路实验"],
            ["04", "如何用 AI 做出内容产品", "把内容、产品和变现视角放在一起看"],
            ["05", "把爆文拆成可复用模板", "今天就能按模板写出自己的第一版"],
          ].map(([index, title, desc]) => (
            <div key={index} className="flex gap-3 rounded-[20px] border border-slate-100 bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">{index}</div>
              <div className="flex-1">
                <div className="text-base font-bold text-slate-900">{title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-500">{desc}</div>
              </div>
              <button className="text-sm font-bold text-slate-400">查看</button>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>返回首页</SecondaryButton>
        <PrimaryButton>打开完整合集</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function MomentsGenerateScreen() {
  return (
    <ScreenFrame label="14 朋友圈文案生成" title="Moments Generate">
      <HeroCard label="朋友圈文案" title="基于现有内容，快速生成更适合朋友圈发布的表达版本" body="自动提炼卖点、调整口语感、补足转化收口，输出可直接发布的文案草稿。" />
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">内容想法</div>
          <div className="text-sm font-semibold text-slate-400">当前文案来源</div>
        </div>
        <p className="text-sm leading-6 text-slate-600">很多人以为，只要更努力地写，就会慢慢找到自己的节奏。但真实情况往往相反：当你没有先解决方向和结构问题时，越努力，只会越拧巴。</p>
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">六大文案框架</div>
          <div className="text-sm font-semibold text-slate-400">优先挑选 2-3 种</div>
        </div>
        <Pills items={["认知教育类", "痛点共鸣类", "方法干货类", "案例拆解类", "日常真实类", "转化成交类"]} active={0} />
      </Card>
      <Card muted>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">表达角度</div>
          <div className="text-sm font-semibold text-slate-400">再挑 2-3 个方向</div>
        </div>
        <Pills items={["场景开场", "对象定位", "选择对比", "选择对比", "成本算账", "用户互动"]} active={0} tone="teal" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["过程盘点", "清单条列"].map((item) => (
            <div key={item} className="rounded-2xl border border-cyan-100 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-600">
              {item}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">目标选择策略</div>
          <div className="text-sm font-semibold text-slate-400">2 个版本</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-blue-50 px-3 py-3 text-center text-sm font-bold text-blue-700">认知教育类</div>
          <div className="rounded-2xl bg-teal-50 px-3 py-3 text-center text-sm font-bold text-teal-700">选择对比</div>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>返回创作页</SecondaryButton>
        <PrimaryButton>生成文案</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

function MomentsRefineScreen() {
  return (
    <ScreenFrame label="15 朋友圈文案精修" title="Moments Refine">
      <HeroCard label="选文案，再精修定稿" title="选文案，再精修定稿" body="点击列表切换，编辑区即时改写。" />
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">文案列表</div>
          <div className="text-sm font-semibold text-slate-400">点击卡片切换，查看每条优势</div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {["共鸣强", "结构清晰", "转化友好"].map((item, index) => (
            <span key={item} className={cn("rounded-full px-3 py-1 text-xs font-bold", index === 1 ? "bg-blue-100 text-blue-700" : "bg-indigo-50 text-indigo-600")}>
              {item}
            </span>
          ))}
        </div>
        <div className="max-h-[260px] space-y-3 overflow-auto pr-2">
          {[
            "最近把内容方向重新梳理了一遍，发现很多卡点都不是努力不够，而是方向和结构没先调顺。",
            "不是你没有素材，而是表达顺序容易乱。先讲结论，再补原因，最后给一个可执行动作，会比单纯堆砌观点好得多。",
            "方向清晰之后，发布频率自然会稳定。你不用每天都从零开始，只要沿着同一主题持续输出，内容就会越来有辨识度。",
            "很多时候写不出来，不是没想法，而是没把最表达的重点讲清楚。先把一层开会留给别人说，剩下再展开。",
          ].map((item, index) => (
            <div key={index} className={cn("rounded-[22px] border p-4", index === 0 ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white")}>
              <p className="text-sm leading-6 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">选中文案（可编辑）</div>
          <div className="text-sm font-semibold text-slate-400">支持粘贴、保存与复制</div>
        </div>
        <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">在这里改语气、结构和结尾 CTA。</div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton>返回上一层重新生成</SecondaryButton>
        <PrimaryButton>复制定稿</PrimaryButton>
      </div>
    </ScreenFrame>
  );
}

const screens = [
  <CopywriterStartScreen key="start" />,
  <KeywordsScreen key="keywords" />,
  <IdeasScreen key="ideas" />,
  <ProfileScreen key="profile" />,
  <TopicsScreen key="topics" />,
  <ArticlesScreen key="articles" />,
  <ArticleDetailScreen key="detail" />,
  <TitleGenerateScreen key="title-generate" />,
  <TitleLibraryScreen key="title-library" />,
  <RankingDetailScreen key="ranking" />,
  <ReadingListDetailScreen key="reading-list" />,
  <MomentsGenerateScreen key="moments-generate" />,
  <MomentsRefineScreen key="moments-refine" />,
];

export default function SelectedFramesGalleryPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-8 py-12">
      <div className="mx-auto max-w-[1720px]">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-indigo-500">Generated From Pencil Selection</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Selected Frame Gallery</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            React + Tailwind + Next.js code generated from the currently selected mobile frames in <code>designs/pencil-ui.pen</code>. Each component is intentionally self-contained so you can split them into route-level files or reuse the shared primitives above.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(390px,390px))] justify-center gap-8">{screens}</div>
      </div>
    </main>
  );
}
