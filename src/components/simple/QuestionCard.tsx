/* eslint-disable react-refresh/only-export-components */
import type {
  ChoiceQuestion,
  NoulQuestion,
  Question,
  QuestionType,
  ScoreQuestion,
} from '../../api/types';
import type { Issue } from '../../api/validate';
import { asText } from '../../lib/format';
import { renameKey, uniqueKey } from '../../store/draft';
import { Button, Disclosure, TypeBadge, cx, typeBlurb, typeLabel } from '../ui';
import { CommitInput, Hint, StructuredField } from './fields';

interface Props {
  id: string;
  question: Question;
  issues: Issue[];
  onRename: (to: string) => void;
  onChange: (q: Question) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function QuestionCard({
  id,
  question,
  issues,
  onRename,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: Props) {
  return (
    <article className="rounded-lg border border-line bg-surface" aria-label={`Question ${id}`}>
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        <CommitInput
          value={id}
          onCommit={onRename}
          ariaLabel="Question id"
          className="h-7 max-w-[16rem] border-transparent bg-transparent px-1 py-0 text-sm hover:border-line"
        />
        <TypeSelect
          value={question.type}
          onChange={(t) => onChange(convertQuestion(question, t))}
        />
        <div className="ml-auto flex items-center">
          <Button
            size="sm"
            variant="ghost"
            aria-label="Move up"
            disabled={isFirst}
            onClick={() => onMove(-1)}
          >
            ↑
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Move down"
            disabled={isLast}
            onClick={() => onMove(1)}
          >
            ↓
          </Button>
          <Button size="sm" variant="danger" aria-label={`Remove ${id}`} onClick={onRemove}>
            ✕
          </Button>
        </div>
      </header>

      <div className="space-y-3 p-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Instructions</label>
          <StructuredField
            ariaLabel={`Instructions for ${id}`}
            value={question.instructions}
            onChange={(v) => onChange({ ...question, instructions: v as Question['instructions'] })}
            placeholder={`e.g. ${typeBlurb[question.type].example}`}
          />
          <Hint>
            The question to ask. Refer to state fields in backticks, like{' '}
            <code className="font-mono">`field`</code>. You can also paste a JSON object to include
            reference data.
          </Hint>
        </div>

        {question.type === 'noul' && <NoulCriteria q={question} onChange={onChange} id={id} />}
        {question.type === 'choice' && <ChoiceCriteria q={question} onChange={onChange} />}
        {question.type === 'score' && <ScoreCriteria q={question} onChange={onChange} id={id} />}

        {issues.length > 0 && (
          <ul className="space-y-0.5 text-xs text-bad">
            {issues.map((i, n) => (
              <li key={n}>• {i.message}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function TypeSelect({
  value,
  onChange,
}: {
  value: QuestionType;
  onChange: (t: QuestionType) => void;
}) {
  return (
    <label className="relative">
      <span className="sr-only">Question type</span>
      <TypeBadge type={value} className="pointer-events-none pr-4" />
      <span className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-[9px] text-faint">
        ▼
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as QuestionType)}
        className="absolute inset-0 cursor-pointer opacity-0"
        title="Change question type"
      >
        {(['noul', 'choice', 'score'] as const).map((t) => (
          <option key={t} value={t}>
            {typeLabel[t]}: {typeBlurb[t].what}
          </option>
        ))}
      </select>
    </label>
  );
}

function NoulCriteria({
  q,
  onChange,
  id,
}: {
  q: NoulQuestion;
  onChange: (q: Question) => void;
  id: string;
}) {
  const has = q.criteria && (q.criteria.true != null || q.criteria.false != null);
  const set = (k: 'true' | 'false', v: unknown) => {
    const next = { ...(q.criteria ?? {}), [k]: v ?? undefined };
    if (next.true == null) delete next.true;
    if (next.false == null) delete next.false;
    const { criteria: _drop, ...rest } = q;
    void _drop;
    onChange(Object.keys(next).length ? { ...rest, criteria: next } : rest);
  };
  return (
    <Disclosure
      summary={has ? 'Yes/no definitions' : 'Define what yes and no mean (optional)'}
      defaultOpen={!!has}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-good">Yes (near 1) means…</label>
          <StructuredField
            nullable
            ariaLabel={`Yes criteria for ${id}`}
            value={q.criteria?.true ?? ''}
            onChange={(v) => set('true', v)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-bad">No (near 0) means…</label>
          <StructuredField
            nullable
            ariaLabel={`No criteria for ${id}`}
            value={q.criteria?.false ?? ''}
            onChange={(v) => set('false', v)}
          />
        </div>
      </div>
      <Hint>Most disagreements are about definitions. Spell them out here.</Hint>
    </Disclosure>
  );
}

function ChoiceCriteria({ q, onChange }: { q: ChoiceQuestion; onChange: (q: Question) => void }) {
  const entries = Object.entries(q.criteria ?? {});
  const setCriteria = (criteria: ChoiceQuestion['criteria']) => onChange({ ...q, criteria });
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-xs font-medium text-muted">Options</label>
        <span className="text-[11px] text-faint">{entries.length} / 255</span>
      </div>
      <div className="space-y-1.5">
        {entries.map(([opt, desc]) => (
          <div
            key={opt}
            className="grid grid-cols-[minmax(5rem,9rem)_1fr_auto] items-start gap-1.5"
          >
            <CommitInput
              ariaLabel={`Option name ${opt}`}
              value={opt}
              onCommit={(to) => setCriteria(renameKey(q.criteria, opt, uniqueKey(q.criteria, to)))}
              className="h-[34px] text-xs"
            />
            <StructuredField
              nullable
              ariaLabel={`Description for option ${opt}`}
              value={desc ?? ''}
              placeholder="Description"
              onChange={(v) => setCriteria({ ...q.criteria, [opt]: v as string | null })}
            />
            <Button
              size="sm"
              variant="danger"
              className="mt-1"
              aria-label={`Remove option ${opt}`}
              onClick={() => {
                const next = { ...q.criteria };
                delete next[opt];
                setCriteria(next);
              }}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="mt-1.5"
        onClick={() =>
          setCriteria({
            ...q.criteria,
            [uniqueKey(q.criteria, `option_${entries.length + 1}`)]: null,
          })
        }
      >
        + Add option
      </Button>
      <Hint>
        The option names are what you get back as the answer. Descriptions act as a rubric. Leave
        one blank if the name says it all.
      </Hint>
    </div>
  );
}

function ScoreCriteria({
  q,
  onChange,
  id,
}: {
  q: ScoreQuestion;
  onChange: (q: Question) => void;
  id: string;
}) {
  const levels = Array.isArray(q.criteria) ? q.criteria : [];
  const set = (criteria: ScoreQuestion['criteria']) => onChange({ ...q, criteria });
  const move = (i: number, d: -1 | 1) => {
    const next = [...levels];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set(next);
  };
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-xs font-medium text-muted">Levels, lowest first</label>
        <span className="text-[11px] text-faint">{levels.length} / 10</span>
      </div>
      <ol className="space-y-1.5">
        {levels.map((lvl, i) => (
          <li key={i} className="grid grid-cols-[1.5rem_1fr_auto] items-start gap-1.5">
            <span className="pt-2 text-right font-mono text-xs text-faint">{i}</span>
            <StructuredField
              ariaLabel={`Level ${i} for ${id}`}
              value={lvl}
              onChange={(v) =>
                set(levels.map((x, j) => (j === i ? (v as ScoreQuestion['criteria'][number]) : x)))
              }
              placeholder={`Describe level ${i}`}
            />
            <div className={cx('mt-1 flex')}>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Move level ${i} up`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                ↑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Move level ${i} down`}
                disabled={i === levels.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </Button>
              <Button
                size="sm"
                variant="danger"
                aria-label={`Remove level ${i}`}
                onClick={() => set(levels.filter((_, j) => j !== i))}
              >
                ✕
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        size="sm"
        variant="ghost"
        className="mt-1.5"
        disabled={levels.length >= 10}
        onClick={() => set([...levels, ''])}
      >
        + Add level
      </Button>
      <Hint>
        Describe what each level looks like rather than just labelling it. The answer is a weighted
        average of these level numbers.
      </Hint>
    </div>
  );
}

/** Switch a question's type, carrying over criteria where it makes sense. */
export function convertQuestion(q: Question, to: QuestionType): Question {
  if (q.type === to) return q;
  const instructions = q.instructions;
  const labels: string[] =
    q.type === 'choice'
      ? Object.keys(q.criteria ?? {})
      : q.type === 'score'
        ? (q.criteria ?? []).map((c) => asText(c))
        : [];
  switch (to) {
    case 'noul':
      return { type: 'noul', instructions };
    case 'score':
      return {
        type: 'score',
        instructions,
        criteria: labels.length >= 2 ? labels.slice(0, 10) : ['Low', 'Medium', 'High'],
      };
    case 'choice': {
      const criteria: Record<string, null> = {};
      for (const l of labels.length >= 2 ? labels : ['option_a', 'option_b']) {
        const key =
          l
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 40) || 'option';
        criteria[uniqueKey(criteria, key)] = null;
      }
      return { type: 'choice', instructions, criteria };
    }
  }
}
