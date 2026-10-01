import { useEffect, useId, useState } from 'react';
import { config, listModels } from '../api/client';
import type { ModelInfo } from '../api/types';
import { usePlayground } from '../store/playground';
import { Term } from './Term';
import { cx } from './ui';

export function RunBar() {
  const { draft, setModel, run, running, issues } = usePlayground();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const listId = useId();

  useEffect(() => {
    listModels().then(setModels);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run]);

  const blocked = issues.length > 0;
  const current = models.find((m) => m.id === draft.model);

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-t border-line bg-surface pl-4">
      <label className="flex items-center gap-2 text-xs text-muted">
        <Term id="alias">Model</Term>
        <input
          list={listId}
          value={draft.model}
          onChange={(e) => setModel(e.target.value)}
          spellCheck={false}
          className="h-7 w-40 rounded border border-line bg-sunken px-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
          aria-label="Model"
          title={
            current?.description ?? 'Any model served by the configured decision model endpoint'
          }
        />
        <datalist id={listId}>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.description ?? ''}
            </option>
          ))}
        </datalist>
      </label>
      <span
        className="hidden min-w-0 flex-1 truncate text-xs text-faint md:block"
        title={issues.map((i) => `${i.path}: ${i.message}`).join('\n')}
      >
        {blocked
          ? `⚠ ${issues[0].message}${issues.length > 1 ? ` (+${issues.length - 1} more)` : ''}`
          : !config.hasKey
            ? 'No API key configured (see banner)'
            : ''}
      </span>
      <button
        onClick={() => void run()}
        disabled={blocked || running}
        className={cx(
          'ml-auto flex h-full shrink-0 items-center gap-2 px-5 text-sm font-medium whitespace-nowrap transition-colors',
          blocked || running
            ? 'cursor-not-allowed bg-sunken text-faint'
            : 'bg-ink text-page hover:opacity-90',
        )}
      >
        {running ? 'Running…' : 'Run request'}
        <kbd className="hidden text-[11px] opacity-60 2xl:inline">Ctrl+↵</kbd>
      </button>
    </div>
  );
}
