import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { homeData } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <AppShell
      activeTab="home"
      headerSlot={
        <Link
          className="rounded-full border border-white bg-white px-3 py-2 text-[12px] font-medium text-[#7f869c] shadow-[0_10px_24px_rgba(106,114,149,0.12)]"
          href="/me"
        >
          {homeData.memberLabel}
        </Link>
      }
      subtitle={homeData.subtitle}
      title={homeData.title}
    >
      <section className="overflow-hidden rounded-[18px] border border-white/80 bg-white shadow-[0_10px_24px_rgba(118,126,162,0.12)]">
        <div className="relative h-[138px] w-full">
          <Image alt={homeData.heroTitle} className="object-cover" fill priority src="/home-banner.png" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,28,38,0.02)_0%,rgba(24,28,38,0.52)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">home</p>
            <h2 className="mt-1 max-w-[210px] text-[20px] font-semibold leading-[1.02] tracking-[-0.05em]">
              {homeData.heroTitle}
            </h2>
            <p className="mt-1 max-w-[248px] text-[11px] leading-4 text-white/80">{homeData.heroDescription}</p>
            <Link
              className="mt-2 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#262c37]"
              href={homeData.heroAction.href}
            >
              {homeData.heroAction.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-white/80 bg-white p-[10px] shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">today ranking</p>
        <div className="mt-1.5 space-y-2">
          {homeData.ranking.map((item, index) => (
            <Link
              key={item.title}
              className={`block rounded-[12px] px-1 py-1 ${index === 0 ? "bg-[#f8f7fe]" : ""}`}
              href={item.href}
            >
              <h2 className={`tracking-[-0.04em] ${index === 0 ? "text-[26px] font-semibold leading-[1.02]" : "text-[16px] font-medium leading-[1.15]"}`}>
                {item.title}
              </h2>
              <p className="mt-1 text-[11px] leading-4 text-[#7f879d]">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[16px] border border-[#ecebfd] bg-[#f8f7fe] p-[10px] shadow-[0_8px_22px_rgba(118,126,162,0.08)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">create</p>
        <h2 className="mt-1.5 text-[24px] font-semibold leading-[1.05] tracking-[-0.04em]">{homeData.creationEntry.title}</h2>
        <p className="mt-1.5 text-[11px] leading-4 text-[#7f879d]">{homeData.creationEntry.description}</p>
        <Link
          className="mt-3 inline-flex rounded-full bg-[#2a2e37] px-3 py-2 text-[11px] font-medium text-white"
          href={homeData.creationEntry.action.href}
        >
          {homeData.creationEntry.action.label}
        </Link>
      </section>

      <section className="rounded-[16px] border border-white/80 bg-white p-[10px] shadow-[0_10px_24px_rgba(118,126,162,0.1)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">assist</p>
        <div className="mt-1.5 space-y-2">
          {homeData.reading.map((item, index) => (
            <Link key={item.title} className="block rounded-[12px] px-1 py-1" href={item.href}>
              <h2 className={`tracking-[-0.04em] ${index === 0 ? "text-[24px] font-semibold leading-[1.05]" : "text-[16px] font-medium leading-[1.15]"}`}>
                {item.title}
              </h2>
              <p className="mt-1 text-[11px] leading-4 text-[#7f879d]">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
