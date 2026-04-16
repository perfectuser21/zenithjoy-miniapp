'use client';

import { useState } from 'react';
import { navGroups, type PageKey } from './showcase-data';
import { cn } from './showcase-primitives';
import { renderPage } from './showcase-pages';

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
