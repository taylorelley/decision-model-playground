import { bandCopy, confidenceBand, type ConfidenceBand } from '../../lib/confidence';
import { cx } from '../ui';

const bandClass: Record<ConfidenceBand, string> = {
  high: 'text-good border-good/30 bg-good/10',
  medium: 'text-warn border-warn/30 bg-warn/10',
  low: 'text-bad border-bad/30 bg-bad/10',
};

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const band = confidenceBand(confidence);
  return (
    <span
      title={`Confidence ${confidence.toFixed(2)}: ${bandCopy[band].action}`}
      className={cx(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
        bandClass[band],
      )}
    >
      <span className="opacity-70">confidence</span> {confidence.toFixed(2)} ·{' '}
      {bandCopy[band].label}
    </span>
  );
}

export function ProbBar({
  label,
  sub,
  p,
  highlight,
  colorClass,
}: {
  label: React.ReactNode;
  sub?: React.ReactNode;
  p: number;
  highlight?: boolean;
  colorClass: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,10rem)_1fr_3rem] items-center gap-3 text-xs">
      <div
        className={cx('truncate', highlight ? 'font-semibold text-ink' : 'text-muted')}
        title={typeof sub === 'string' ? sub : undefined}
      >
        {label}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-sunken">
        <div
          className={cx(
            'h-full rounded-full transition-[width] duration-500',
            colorClass,
            !highlight && 'opacity-40',
          )}
          style={{ width: `${Math.max(0, Math.min(1, p)) * 100}%` }}
        />
      </div>
      <div
        className={cx(
          'text-right tabular-nums',
          highlight ? 'font-semibold text-ink' : 'text-muted',
        )}
      >
        {(p * 100).toFixed(p > 0 && p < 0.01 ? 1 : 0)}%
      </div>
    </div>
  );
}

export function Explainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-md bg-sunken p-3 text-xs leading-relaxed text-muted">
      {children}
    </div>
  );
}

export function Mono({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[11.5px] text-ink">{children}</code>;
}
