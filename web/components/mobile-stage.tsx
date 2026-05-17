import type { ReactNode } from "react";

export function MobileStage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_28%),linear-gradient(180deg,#edf0fb_0%,#e7ebf8_100%)] px-4 py-8 md:px-10">
      <div className="w-full max-w-[390px] overflow-hidden rounded-[40px] border border-white/70 bg-[#f6f7fe] shadow-[0_24px_80px_rgba(72,86,122,0.18)]">
        {children}
      </div>
    </div>
  );
}
