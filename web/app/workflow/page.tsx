import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { workflowData } from "@/lib/mock-data";

export default function WorkflowPage() {
  return (
    <AppShell activeTab="workflow" subtitle={workflowData.subtitle} title={workflowData.title}>
      <section className="overflow-hidden rounded-[18px] border border-white/80 bg-white shadow-[0_10px_24px_rgba(118,126,162,0.12)]">
        <div className="relative h-[148px] w-full">
          <Image alt="Workflow banner" className="object-cover" fill priority src="/workflow-banner.png" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,28,38,0.04)_0%,rgba(24,28,38,0.55)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">workflow</p>
            <h2 className="mt-1 max-w-[220px] text-[20px] font-semibold leading-[1.02] tracking-[-0.05em]">
              把创作路径收在一个入口里
            </h2>
            <p className="mt-1 text-[11px] leading-4 text-white/80">自媒体创作、标题生成、朋友圈文案，都从这里分发。</p>
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-white/80 bg-white p-[10px] shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">create tools</p>
        <div className="mt-1.5 space-y-3">
          <div className="rounded-[12px] bg-[#f8f7fe] p-3">
            <h2 className="text-[24px] font-semibold leading-[1.05] tracking-[-0.04em]">{workflowData.flows[0].title}</h2>
            <p className="mt-1.5 text-[11px] leading-4 text-[#7f879d]">{workflowData.flows[0].description}</p>
            <Link className="mt-3 inline-flex rounded-full bg-[#2a2e37] px-3 py-2 text-[11px] font-medium text-white" href={workflowData.flows[0].href}>
              {workflowData.flows[0].action}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {workflowData.flows.slice(1).map((flow) => (
              <Link key={flow.title} className="rounded-[12px] border border-[#eef0f7] bg-[#fbfcff] p-3" href={flow.href}>
                <h3 className="text-[16px] font-semibold leading-[1.12] tracking-[-0.04em]">{flow.title}</h3>
                <p className="mt-1.5 text-[11px] leading-4 text-[#7f879d]">{flow.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {workflowData.flows.slice(1).map((flow, index) => (
        <section key={flow.title} className="rounded-[16px] border border-white/80 bg-white p-[10px] shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">{index === 0 ? "title section" : "moments section"}</p>
          <h2 className="mt-1.5 text-[24px] font-semibold leading-[1.05] tracking-[-0.04em]">{flow.title}</h2>
          <p className="mt-1.5 text-[11px] leading-4 text-[#7f879d]">{flow.description}</p>
          <Link className="mt-3 inline-flex rounded-full bg-[#2a2e37] px-3 py-2 text-[11px] font-medium text-white" href={flow.href}>
            {flow.action}
          </Link>
        </section>
      ))}
    </AppShell>
  );
}
