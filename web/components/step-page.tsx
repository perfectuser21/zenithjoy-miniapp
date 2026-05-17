import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FlowHeader } from "@/components/flow-header";
import { SectionCard } from "@/components/section-card";
import type { StepPageData } from "@/lib/mock-data";

export function StepPage({ data }: { data: StepPageData }) {
  return (
    <AppShell activeTab={null} showBottomNav={false} subtitle={undefined} title="Pencil Flow">
      <FlowHeader backHref={data.backHref} code={data.code} description={data.description} title={data.title} />
      {data.chips?.length ? (
        <section className="flex flex-wrap gap-2">
          {data.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-[#edd7c6] bg-[#fff7ef] px-4 py-2 text-xs font-medium text-[#8f6d54]"
            >
              {chip}
            </span>
          ))}
        </section>
      ) : null}
      <section className="space-y-4">
        {data.highlights.map((item) => (
          <SectionCard
            key={item.title}
            cta={item.cta}
            description={item.description}
            emphasis={item.emphasis}
            eyebrow={item.eyebrow}
            href={item.href}
            title={item.title}
          />
        ))}
      </section>
      {data.nextHref && data.nextLabel ? (
        <Link
          className="inline-flex w-full items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#f26d5b_0%,#f49b67_100%)] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,109,91,0.28)]"
          href={data.nextHref}
        >
          {data.nextLabel}
        </Link>
      ) : null}
    </AppShell>
  );
}
