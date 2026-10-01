/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TypeBadge, cx } from '../components/ui';
import { categories, examples } from '../content/examples';
import type { Example, ExampleCategory } from '../content/types';
import { primitivesUsed } from '../lib/primitives';
import { usePlayground, type Mode } from '../store/playground';

export function GalleryPage() {
  const [filter, setFilter] = useState<ExampleCategory | 'All'>('All');
  const shown = filter === 'All' ? examples : examples.filter((e) => e.category === filter);
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Use cases</h1>
      <div className="mt-6 flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
        {(['All', ...categories] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cx(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              filter === c
                ? 'border-brand bg-brand text-on-brand'
                : 'border-line text-muted hover:text-ink',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {shown.map((e) => (
          <ExampleCard key={e.id} example={e} />
        ))}
      </div>
    </div>
  );
}

export function useOpenExample() {
  const { load } = usePlayground();
  const navigate = useNavigate();
  return (e: Example, mode: Mode) => {
    load(e.request, { mode, title: e.title });
    navigate('/playground');
  };
}

function ExampleCard({ example: e }: { example: Example }) {
  const open = useOpenExample();
  const n = Object.keys(e.request.questions).length;
  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] text-faint">{e.category}</div>
          <h2 className="font-semibold">{e.title}</h2>
        </div>
        <div className="flex shrink-0 gap-1">
          {primitivesUsed(e.request.questions).map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        <span className="font-medium text-ink">Why these primitives: </span>
        {e.why}
      </p>
      {e.inCode && (
        <p className="mt-2 rounded bg-sunken px-2.5 py-1.5 font-mono text-[11.5px] leading-relaxed text-muted">
          <span className="text-faint">// in your code: </span>
          {e.inCode}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        <Button size="sm" variant="primary" onClick={() => open(e, 'simple')}>
          Open in Simple
        </Button>
        <Button size="sm" onClick={() => open(e, 'dev')}>
          Open in Developer
        </Button>
        <span className="ml-auto text-xs text-faint">{n} questions</span>
      </div>
    </article>
  );
}
