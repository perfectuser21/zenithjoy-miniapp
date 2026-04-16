'use client';

import type { ReactNode } from 'react';
import type { StepTone } from './showcase-data';

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function PhoneFrame({
  children,
  background,
}: {
  children: ReactNode;
  background: string;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[390px] overflow-hidden rounded-[34px] border border-white/60 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
      style={{ background }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8 bg-gradient-to-b from-black/5 to-transparent" />
      {children}
    </div>
  );
}

export function FloatingLabel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute left-3 top-3 z-20 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold tracking-[0.02em] text-white">
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  soft = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  soft?: boolean;
}) {
  return (
    <section
      className={cn(
        'rounded-[22px] border p-4',
        soft ? 'border-slate-200 bg-slate-50/90' : 'border-slate-200/80 bg-white/90',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-[11px] font-medium text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn('rounded-full px-3 py-1 text-[11px] font-bold', className)}>{children}</span>;
}

export function ButtonRow({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <div className="mt-auto flex gap-3">
      <button
        type="button"
        className="h-11 flex-1 rounded-full border border-slate-300 bg-white text-[14px] font-semibold text-slate-700"
      >
        {secondary}
      </button>
      <button
        type="button"
        className="h-11 flex-1 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(79,70,229,0.28)]"
      >
        {primary}
      </button>
    </div>
  );
}

export function WorkflowPage({
  label,
  title,
  intro,
  tone,
  children,
  footerPrimary = '继续下一步',
  footerSecondary = '返回工作流',
}: {
  label: string;
  title: string;
  intro: string;
  tone: StepTone;
  children: ReactNode;
  footerPrimary?: string;
  footerSecondary?: string;
}) {
  return (
    <PhoneFrame background={`linear-gradient(180deg, ${tone.pageBgTop} 0%, ${tone.pageBg} 100%)`}>
      <div className="relative flex min-h-[844px] flex-col px-5 pb-5 pt-2 font-[Inter,sans-serif] text-slate-900">
        <div
          className="pointer-events-none absolute right-[-12px] top-20 h-[160px] w-[160px] rounded-full blur-xl"
          style={{ background: tone.orb }}
        />
        <FloatingLabel>{label}</FloatingLabel>
        <div className="mt-8 flex flex-1 flex-col gap-4">
          <section
            className="rounded-[28px] border border-white/20 p-5 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]"
            style={{ background: `linear-gradient(135deg, ${tone.heroStart} 0%, ${tone.heroEnd} 100%)` }}
          >
            <p className="text-[12px] font-semibold text-white/80">Workflow</p>
            <h1 className="mt-1 text-[24px] font-bold leading-[1.15]">{title}</h1>
            <p className="mt-2 text-[13px] leading-[1.45] text-white/85">{intro}</p>
          </section>

          {children}

          <ButtonRow primary={footerPrimary} secondary={footerSecondary} />
        </div>
      </div>
    </PhoneFrame>
  );
}
