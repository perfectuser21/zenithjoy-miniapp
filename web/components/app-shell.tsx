import type { ReactNode } from "react";
import type { TabKey } from "@/lib/routes";
import { BottomNav } from "@/components/bottom-nav";
import { MobileStage } from "@/components/mobile-stage";

type AppShellProps = {
  title: string;
  subtitle?: string;
  activeTab: TabKey;
  showBottomNav?: boolean;
  children: ReactNode;
  headerSlot?: ReactNode;
};

export function AppShell({
  title,
  subtitle,
  activeTab,
  showBottomNav = true,
  children,
  headerSlot
}: AppShellProps) {
  return (
    <MobileStage>
      <main className="min-h-screen bg-[#f6f7fe] px-5 pb-1 pt-2 text-[#1f2430]">
        <header className="mb-2 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ca3bb]">ZenithJoy</p>
            <h1 className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.05em]">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-[280px] text-[12px] leading-5 text-[#7f879d]">{subtitle}</p> : null}
          </div>
          {headerSlot}
        </header>
        <div className="space-y-[8px]">{children}</div>
        {showBottomNav ? <BottomNav activeTab={activeTab} /> : null}
      </main>
    </MobileStage>
  );
}
