import { useEffect, useRef, useState } from 'react';
import type { Question } from '../../api/types';
import { stateKind } from '../../store/draft';
import { usePlayground } from '../../store/playground';
import { JsonEditor } from '../JsonEditor';
import { cx } from '../ui';

function questionsText(q: Record<string, Question>) {
  return Object.keys(q).length ? JSON.stringify(q, null, 2) : '';
}

export function DevEditors() {
  const { draft, setStateText, setQuestions, issues } = usePlayground();
  const [qText, setQText] = useState(() => questionsText(draft.questions));
  const [parseError, setParseError] = useState<string | null>(null);
  const lastEmitted = useRef(draft.questions);

  // Re-sync the editor when questions change from outside (loading an example, simple mode).
  useEffect(() => {
    if (draft.questions !== lastEmitted.current) {
      setQText(questionsText(draft.questions));
      setParseError(null);
      lastEmitted.current = draft.questions;
    }
  }, [draft.questions]);

  const onQuestions = (t: string) => {
    setQText(t);
    if (!t.trim()) {
      setParseError(null);
      lastEmitted.current = {};
      setQuestions(lastEmitted.current);
      return;
    }
    try {
      const parsed = JSON.parse(t) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error('Questions must be a JSON object: { "id": { … } }');
      setParseError(null);
      lastEmitted.current = parsed as Record<string, Question>;
      setQuestions(lastEmitted.current);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e));
    }
  };

  const kind = stateKind(draft.stateText);
  const qIssues = issues.filter((i) => i.path.startsWith('questions'));

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
      <Pane
        title="State"
        right={
          <span className="text-[11px] text-faint">
            {kind === 'empty'
              ? 'string | object | array'
              : kind === 'text'
                ? 'sent as text (not JSON)'
                : `JSON ${kind}`}
          </span>
        }
      >
        <JsonEditor
          ariaLabel="State editor"
          value={draft.stateText}
          onChange={setStateText}
          placeholder={'{\n  "example_state": "Add context for the model to evaluate"\n}'}
        />
      </Pane>
      <Pane
        title="Questions"
        className="border-t border-line"
        right={
          <span
            className={cx('text-[11px]', parseError || qIssues.length ? 'text-bad' : 'text-faint')}
            title={qIssues.map((i) => `${i.path}: ${i.message}`).join('\n')}
          >
            {parseError
              ? 'Invalid JSON'
              : qIssues.length
                ? `${qIssues.length} issue${qIssues.length > 1 ? 's' : ''}`
                : `${Object.keys(draft.questions).length} questions`}
          </span>
        }
        footer={
          (parseError || qIssues.length > 0) && (
            <ul className="max-h-24 shrink-0 overflow-auto border-t border-line bg-bad/5 px-3 py-1.5 font-mono text-[11px] text-bad">
              {parseError ? (
                <li>{parseError}</li>
              ) : (
                qIssues.map((i, n) => (
                  <li key={n}>
                    {i.path}: {i.message}
                  </li>
                ))
              )}
            </ul>
          )
        }
      >
        <JsonEditor
          ariaLabel="Questions editor"
          value={qText}
          onChange={onQuestions}
          placeholder={
            '{\n  "is_urgent": {\n    "type": "noul",\n    "instructions": "Does this convey urgency?"\n  }\n}'
          }
        />
      </Pane>
    </div>
  );
}

function Pane({
  title,
  right,
  children,
  footer,
  className,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('flex min-h-0 flex-col bg-surface', className)} aria-label={title}>
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-line px-4">
        <span className="text-sm text-muted">{title}</span>
        {right}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      {footer}
    </section>
  );
}
