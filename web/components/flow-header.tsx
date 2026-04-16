import Link from "next/link";

export function FlowHeader({
  code,
  title,
  description,
  backHref
}: {
  code: string;
  title: string;
  description: string;
  backHref: string;
}) {
  return (
    <section className="rounded-[30px] border border-[#f2dccc] bg-white/85 p-5 shadow-[0_18px_36px_rgba(138,111,73,0.12)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b38f61]">{code}</p>
        <Link className="rounded-full border border-[#e9d1bf] px-3 py-1 text-xs font-medium text-[#6b5444]" href={backHref}>
          返回
        </Link>
      </div>
      <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.04em]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-[#6e5b4d]">{description}</p>
    </section>
  );
}
