import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const variants = [
  "更口语一点",
  "更适合成交",
  "更像个人表达",
  "更轻一点",
  "保留原观点",
  "拉高氛围感"
];

const angles = [
  "提炼卖点，保留真实口语感",
  "把原句式收紧，减少讲道理感",
  "补上转化收口，让结尾更自然",
  "强调节奏和停顿，适合朋友圈阅读"
];

export default function MomentsGeneratePage() {
  return (
    <AppShell activeTab={null} showBottomNav={false} subtitle="14 朋友圈文案生成" title="朋友圈文案">
      <section className="rounded-[26px] border border-white/15 bg-[linear-gradient(135deg,#1847d8_0%,#4263eb_58%,#16a3b7_100%)] p-4 text-white shadow-[0_18px_40px_rgba(44,90,220,0.28)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ddebff]">朋友圈文案</p>
        <h2 className="mt-2 text-[22px] font-semibold leading-[1.12] tracking-[-0.05em]">
          基于现有内容，快速生成更适合朋友圈发布的表达版本
        </h2>
        <p className="mt-2 text-[12px] leading-5 text-[#e6f4ff]">
          自动提炼卖点、调整口语感、补足转化收口，输出可直接发布的文案草稿。
        </p>
      </section>

      <section className="rounded-[18px] border border-[#e3eaf5] bg-white/95 p-3 shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">source</p>
          <span className="rounded-full bg-[#f3f6fb] px-2.5 py-1 text-[10px] font-medium text-[#78839c]">原始内容</span>
        </div>
        <p className="mt-2 text-[14px] leading-[1.48] text-[#425466]">
          很多人以为，只要更努力地写，就会慢慢找到自己的节奏。但真实情况往往是：当你没有先解决方向和结构问题时，越努力，只会越拧巴。
        </p>
      </section>

      <section className="rounded-[18px] border border-[#e3eaf5] bg-white/95 p-3 shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">variant</p>
          <span className="rounded-full bg-[#f3f6fb] px-2.5 py-1 text-[10px] font-medium text-[#78839c]">表达版本</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {variants.map((item, index) => (
            <div
              key={item}
              className={`rounded-[12px] px-2 py-2 text-center text-[11px] font-medium ${
                index === 0
                  ? "bg-[linear-gradient(180deg,#edf3ff_0%,#e3eeff_100%)] text-[#2450d3]"
                  : "border border-[#e7edf8] bg-[#fbfcff] text-[#6d7892]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[20px] border border-[#d6eef3] bg-[linear-gradient(180deg,#f3fafd_0%,#ecf7fb_100%)] p-3.5 shadow-[0_10px_24px_rgba(115,170,189,0.12)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7e9fad]">angle</p>
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-medium text-[#628394]">生成角度</span>
        </div>
        <div className="mt-3 space-y-2.5">
          {angles.map((item, index) => (
            <div
              key={item}
              className={`rounded-[14px] px-3 py-3 text-[12px] leading-4 ${
                index === 0
                  ? "bg-white text-[#27485d] shadow-[0_10px_18px_rgba(148,196,211,0.18)]"
                  : "border border-[#dceef4] bg-white/65 text-[#5b7988]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[18px] border border-[#e3eaf5] bg-white/95 p-3 shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">strategy</p>
          <span className="rounded-full bg-[#f3f6fb] px-2.5 py-1 text-[10px] font-medium text-[#78839c]">策略建议</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="rounded-full bg-[#eef4ff] px-3 py-2 text-[11px] font-medium text-[#3562e1]">优先保留真实表达</div>
          <div className="rounded-full border border-[#e3eaf5] bg-white px-3 py-2 text-[11px] font-medium text-[#7f879d]">最后一句补动作</div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Link
          className="flex h-12 items-center justify-center rounded-[24px] border border-[#d4dce8] bg-white/95 text-[12px] font-medium text-[#5f6b84]"
          href="/workflow"
        >
          返回工作流
        </Link>
        <Link
          className="flex h-12 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#2e5bff_0%,#0fa6b8_100%)] text-[12px] font-semibold text-white shadow-[0_16px_30px_rgba(46,91,255,0.24)]"
          href="/moments/editor"
        >
          进入精修页
        </Link>
      </div>
    </AppShell>
  );
}
