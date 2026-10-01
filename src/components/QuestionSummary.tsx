/* eslint-disable react-refresh/only-export-components */
import type { Question } from '../api/types';
import { asText } from '../lib/format';
import { TypeBadge } from './ui';

export function questionMeta(q: Question): string {
  if (q.type === 'choice') {
    const n = Object.keys(q.criteria ?? {}).length;
    return `${n} option${n === 1 ? '' : 's'}`;
  }
  if (q.type === 'score') {
    const n = Array.isArray(q.criteria) ? q.criteria.length : 0;
    return `${n} levels · 0–${Math.max(0, n - 1)}`;
  }
  return 'probability 0–1';
}

/** Pre-run preview of a question, like the console's Response › Preview list. */
export function QuestionSummary({ id, question }: { id: string; question: Question }) {
  const instr = question.instructions;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3.5 last:border-b-0">
      <div className="min-w-0">
        <div className="font-mono text-sm">{id}</div>
        {instr && typeof instr === 'object' && !Array.isArray(instr) ? (
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 text-xs text-muted">
            {Object.entries(instr).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-mono text-faint">{k}:</dt>
                <dd className="line-clamp-2">{asText(v)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-1 line-clamp-3 text-xs text-muted italic">
            {asText(instr) || <span className="text-faint">No instructions yet</span>}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        {['noul', 'choice', 'score'].includes(question.type) && <TypeBadge type={question.type} />}
        <div className="mt-1.5 text-[11px] text-faint">{questionMeta(question)}</div>
      </div>
    </div>
  );
}
