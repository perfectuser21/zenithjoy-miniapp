'use client';

import type { CSSProperties } from 'react';

type PreviewCard = {
  body: string;
  label: string;
  emphasized?: boolean;
};

export type MomentsPreviewPageProps = {
  title?: string;
  subtitle?: string;
  versionCount?: string;
  tags?: string[];
  previews?: PreviewCard[];
  onBack?: () => void;
  onRegenerate?: () => void;
  onUseCopy?: () => void;
};

const defaultTags = ['价值表达', '口语表达', '结尾收口'];

const defaultPreviews: PreviewCard[] = [
  {
    body:
      '很多人做内容时，最先补的都是努力，但真正决定结果的，往往是方向、结构和表达方式。方向不对，越写越累；结构不清，越写越散。先把底层问题校准，内容才会真正开始长出来。',
    label: '价值表达 · 适合直接发布',
    emphasized: true,
  },
  {
    body:
      '不是你不够努力，而是很多时候内容迟迟起不来，本质上是方向、结构和表达方式还没有被调顺。先把底层逻辑理清，输出才会开始变稳。',
    label: '观点型版本 · 更适合建立认知',
  },
  {
    body:
      '很多人一开始把内容做不起来，不是因为不肯努力，而是还没先把方向和表达方式调顺。底层一旦通了，写作就不会再那么拧巴。',
    label: '轻口语版本 · 更像朋友圈日常表达',
  },
];

const tokenStyle: CSSProperties = {
  ['--page-bg' as string]: '#EEF2FF',
  ['--page-bg-top' as string]: '#F6F7FE',
  ['--surface' as string]: '#FFFFFF',
  ['--surface-soft' as string]: '#EEF3FF',
  ['--surface-border' as string]: '#E5E7F0',
  ['--surface-border-strong' as string]: '#D9E2FF',
  ['--text-strong' as string]: '#101828',
  ['--text-main' as string]: '#344054',
  ['--text-muted' as string]: '#667085',
  ['--text-subtle' as string]: '#7A7E9A',
  ['--hero-start' as string]: '#243BCE',
  ['--hero-end' as string]: '#5A4CFF',
  ['--button-start' as string]: '#6E65FF',
  ['--button-end' as string]: '#314FDB',
  ['--tag-blue-bg' as string]: '#DDE6FF',
  ['--tag-blue-text' as string]: '#3151D7',
  ['--tag-purple-bg' as string]: '#F4EEFF',
  ['--tag-purple-text' as string]: '#7A4EDC',
  ['--tag-cyan-bg' as string]: '#EEF6FF',
  ['--tag-cyan-text' as string]: '#4B6FCF',
  ['--orb' as string]: '#D7DFFF33',
} as CSSProperties;

const tagToneClasses = [
  'bg-[var(--tag-blue-bg)] text-[var(--tag-blue-text)]',
  'bg-[var(--tag-purple-bg)] text-[var(--tag-purple-text)]',
  'bg-[var(--tag-cyan-bg)] text-[var(--tag-cyan-text)]',
];

export default function MomentsPreviewPage({
  title = '测试内容1',
  subtitle = '支持切换版本、快速重生成，并将满意文案带回创作流程。',
  versionCount = '3 个版本',
  tags = defaultTags,
  previews = defaultPreviews,
  onBack,
  onRegenerate,
  onUseCopy,
}: MomentsPreviewPageProps) {
  return (
    <div
      style={tokenStyle}
      className="relative mx-auto flex min-h-[844px] w-full max-w-[390px] overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,var(--page-bg-top)_0%,var(--page-bg)_100%)] font-[Inter,sans-serif] text-[var(--text-strong)] shadow-[0_24px_80px_rgba(61,80,180,0.18)]"
    >
      <div className="pointer-events-none absolute left-[282px] top-[84px] h-[150px] w-[150px] rounded-full bg-[var(--orb)] blur-[10px]" />

      <div className="relative flex h-full w-full flex-col gap-2 px-5 pb-[10px] pt-2">
        <div className="flex h-[42px] items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-white/80 px-3 py-2 text-[13px] font-bold text-[var(--text-main)] shadow-[0_8px_24px_rgba(31,41,55,0.06)] backdrop-blur-sm"
          >
            返回
          </button>

          <div
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            className="rounded-full bg-white/85 px-3 py-2 text-[11px] font-semibold text-[#4F46E5] shadow-[0_8px_24px_rgba(31,41,55,0.06)] backdrop-blur-sm"
          >
            文案预览页
          </div>
        </div>

        <section className="flex w-full flex-col gap-1.5 rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,var(--hero-start)_0%,var(--hero-end)_100%)] p-4 shadow-[0_16px_40px_rgba(58,78,218,0.28)]">
          <p className="text-[13px] font-semibold text-[#E1E8FF]">朋友圈文案预览</p>
          <h1 className="text-[22px] font-bold leading-[1.22] text-white">{title}</h1>
          <p className="text-[13px] leading-[1.4] text-[#E7ECFF]">{subtitle}</p>
        </section>

        <section className="flex w-full flex-col gap-1.5 rounded-[20px] border border-[var(--surface-border-strong)] bg-[var(--surface)] p-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-bold text-[#2947D3]">生成配置</h2>
            <span className="text-[12px] font-semibold text-[var(--text-subtle)]">{versionCount}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className={`rounded-full px-[10px] py-1.5 text-[11px] font-bold ${tagToneClasses[index % tagToneClasses.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="flex w-full flex-1 flex-col gap-2 rounded-[20px] bg-[var(--surface)] p-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-[var(--text-strong)]">生成预览</h2>
            <span className="text-[12px] font-semibold text-[var(--text-subtle)]">上下滑动查看</span>
          </div>

          <div className="flex w-full flex-col gap-2">
            {previews.map((item, index) => (
              <article
                key={index}
                className={`flex w-full flex-col gap-1.5 rounded-2xl px-[14px] py-3 ${
                  item.emphasized
                    ? 'bg-[var(--surface-soft)]'
                    : 'border border-[var(--surface-border)] bg-[var(--surface)]'
                }`}
              >
                <p className="text-[13px] font-normal leading-[1.42] text-[var(--text-strong)]">{item.body}</p>
                <p className="text-[12px] font-normal text-[var(--text-muted)]">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="flex h-10 w-full gap-[10px]">
          <button
            type="button"
            onClick={onRegenerate}
            className="flex-1 rounded-full border border-[#D0D5DD] bg-[var(--surface)] text-[14px] font-semibold text-[var(--text-main)] shadow-[0_4px_12px_rgba(16,24,40,0.04)]"
          >
            换一种表达
          </button>
          <button
            type="button"
            onClick={onUseCopy}
            className="flex-1 rounded-full bg-[linear-gradient(180deg,var(--button-start)_0%,var(--button-end)_100%)] text-[14px] font-bold text-white shadow-[0_14px_28px_rgba(68,83,224,0.28)]"
          >
            加入创作页
          </button>
        </div>
      </div>
    </div>
  );
}
