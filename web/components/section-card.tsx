import Link from "next/link";

type SectionCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
  emphasis?: "primary" | "secondary";
};

export function SectionCard({
  eyebrow,
  title,
  description,
  href,
  cta,
  emphasis = "secondary"
}: SectionCardProps) {
  return (
    <article
      className={`rounded-[30px] border p-5 ${
        emphasis === "primary"
          ? "border-[#ffd8c6] bg-[linear-gradient(180deg,#fff7f1_0%,#fff0e5_100%)] shadow-[0_20px_40px_rgba(242,109,91,0.14)]"
          : "border-white/70 bg-white/78 shadow-[0_16px_34px_rgba(138,111,73,0.1)]"
      }`}
    >
      {eyebrow ? (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b38f61]">{eyebrow}</p>
      ) : null}
      <h2 className={`leading-tight tracking-[-0.04em] ${emphasis === "primary" ? "text-[30px]" : "text-[22px]"} font-semibold`}>
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#6e5b4d]">{description}</p>
      {href && cta ? (
        <Link
          className="mt-5 inline-flex rounded-full bg-[#2d221b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d140f]"
          href={href}
        >
          {cta}
        </Link>
      ) : null}
    </article>
  );
}
