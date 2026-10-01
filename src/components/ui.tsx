/* eslint-disable react-refresh/only-export-components */
import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { QuestionType } from '../api/types';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export const typeLabel: Record<QuestionType, string> = {
  noul: 'Noul',
  choice: 'Choice',
  score: 'Score',
};
export const typeColor: Record<QuestionType, string> = {
  noul: 'text-noul',
  choice: 'text-choice',
  score: 'text-score',
};
export const typeBg: Record<QuestionType, string> = {
  noul: 'bg-noul',
  choice: 'bg-choice',
  score: 'bg-score',
};
export const typeBlurb: Record<QuestionType, { what: string; example: string }> = {
  noul: { what: 'Evaluate how true something is', example: 'Does `readback` match `clearance`?' },
  score: { what: 'Set up a rubric to grade with', example: 'How severe was `occurrence`?' },
  choice: { what: 'Ask a multiple choice question', example: 'Which runway suits `metar`?' },
};

export function TypeBadge({ type, className }: { type: QuestionType; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded border border-line bg-sunken px-1.5 py-0.5 text-[11px] font-medium',
        typeColor[type],
        className,
      )}
    >
      {typeLabel[type]}
    </span>
  );
}

export function Button({
  variant = 'default',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  return (
    <button
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-7 px-2 text-xs' : 'h-9 px-3 text-sm',
        variant === 'primary' && 'bg-ink text-page hover:opacity-90',
        variant === 'default' && 'border border-line bg-surface text-ink hover:bg-sunken',
        variant === 'ghost' && 'text-muted hover:bg-sunken hover:text-ink',
        variant === 'danger' && 'text-muted hover:bg-sunken hover:text-bad',
        className,
      )}
    />
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; title?: string }[];
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cx('inline-flex rounded-md border border-line bg-sunken p-0.5', className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cx(
            'rounded px-2.5 py-1 text-xs font-medium transition-colors',
            value === o.value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  className,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        <span className={cx('inline-block transition-transform', open && 'rotate-90')}>▸</span>
        {summary}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx('text-[11px] font-semibold tracking-[0.08em] text-muted uppercase', className)}
    >
      {children}
    </div>
  );
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
      {children}
      <span aria-hidden> ↗</span>
    </a>
  );
}
