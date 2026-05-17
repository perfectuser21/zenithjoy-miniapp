import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const editOptions = ["去 AI 味", "更口语", "补结尾动作", "更像朋友圈"];

export default function MomentsEditorPage() {
  return (
    <AppShell activeTab={null} showBottomNav={false} subtitle="15 朋友圈文案精修" title="朋友圈文案精修">
      <section className="rounded-[26px] border border-white/15 bg-[linear-gradient(135deg,#243bce_0%,#5a4cff_100%)] px-3 py-3 text-white shadow-[0_18px_40px_rgba(70,79,226,0.28)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8deff]">editor</p>
        <h2 className="mt-1.5 text-[18px] font-semibold leading-[1.15] tracking-[-0.05em]">把语气、节奏和结尾动作再修到更自然</h2>
        <p className="mt-1.5 text-[11px] leading-4 text-[#e7e9ff]">保留原意思，但把朋友圈的阅读感、口语感和信任感做出来。</p>
      </section>

      <section className="rounded-[22px] border border-white/80 bg-white/95 p-3 shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">preview</p>
          <span className="rounded-full bg-[#f3f5fb] px-2.5 py-1 text-[10px] font-medium text-[#7a84a0]">预览文案</span>
        </div>
        <div className="mt-3 rounded-[18px] bg-[linear-gradient(180deg,#f8f9ff_0%,#f2f4ff_100%)] p-3">
          <p className="text-[14px] leading-[1.58] text-[#364152]">
            很多人不是不够努力，而是努力的方向从一开始就拧了。内容也一样，如果结构没先理顺，写得越多，反而越容易把自己绕进去。
          </p>
          <p className="mt-3 text-[14px] leading-[1.58] text-[#364152]">
            真正有用的方式，不是逼自己更勤奋，而是先把表达路径和重点抓出来。这样你发出去的每一句，才会更像你，也更容易被看懂。
          </p>
        </div>
      </section>

      <section className="rounded-[22px] border border-white/80 bg-white/95 p-3 shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">editor panel</p>
          <span className="rounded-full bg-[#f3f5fb] px-2.5 py-1 text-[10px] font-medium text-[#7a84a0]">编辑动作</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {editOptions.map((item, index) => (
            <div
              key={item}
              className={`rounded-[14px] px-3 py-3 text-center text-[11px] font-medium ${
                index === 0
                  ? "bg-[linear-gradient(180deg,#eef1ff_0%,#e6ebff_100%)] text-[#4855d9]"
                  : "border border-[#e6eaf4] bg-[#fbfcff] text-[#7b859c]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-[1.15fr_0.85fr] gap-1.5">
        <div className="rounded-[18px] border border-white/80 bg-white/95 p-3 shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">notes</p>
          <p className="mt-2 text-[12px] leading-5 text-[#667085]">
            第一段保留判断，第二段补转化动作。删掉太满的讲解感，换成更像聊天的表达。
          </p>
        </div>
        <div className="rounded-[18px] border border-[#e6e8ff] bg-[linear-gradient(180deg,#f8f7ff_0%,#f2f0ff_100%)] p-3 shadow-[0_10px_24px_rgba(126,119,212,0.1)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9089d5]">status</p>
          <p className="mt-2 text-[12px] leading-5 text-[#635fa2]">当前版本适合走“真实经验 + 温和收口”的朋友圈表达。</p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <Link
          className="flex h-9 items-center justify-center rounded-[18px] border border-[#d7dcef] bg-white/95 text-[11px] font-medium text-[#5f6b84]"
          href="/moments/generate"
        >
          返回生成页
        </Link>
        <Link
          className="flex h-9 items-center justify-center rounded-[18px] bg-[#2a2e37] text-[11px] font-semibold text-white shadow-[0_12px_22px_rgba(42,46,55,0.18)]"
          href="/workflow"
        >
          完成并返回
        </Link>
      </div>
    </AppShell>
  );
}
