import Link from "next/link";
import { primaryRoutes, type TabKey } from "@/lib/routes";

export function BottomNav({ activeTab }: { activeTab: TabKey }) {
  return (
    <nav className="mt-1 grid grid-cols-4 gap-1 rounded-[36px] border border-[#eef0f7] bg-white p-1 shadow-[0_14px_30px_rgba(118,126,162,0.14)]">
      {primaryRoutes.map((route) => {
        const active = route.tab === activeTab;
        return (
          <Link
            key={route.href}
            className={`rounded-[30px] px-3 py-[11px] text-center text-[12px] font-medium transition ${
              active
                ? "bg-[#2a2e37] text-white shadow-[0_10px_20px_rgba(42,46,55,0.18)]"
                : "text-[#8a90a6]"
            }`}
            href={route.href}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
