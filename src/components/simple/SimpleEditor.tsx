import type { QuestionType } from '../../api/types';
import {
  blankQuestion,
  looksLikeBrokenJson,
  renameKey,
  stateKind,
  uniqueKey,
} from '../../store/draft';
import { usePlayground } from '../../store/playground';
import { Term } from '../Term';
import { SectionLabel, TypeBadge, cx, typeBlurb } from '../ui';
import { Hint, TextArea } from './fields';
import { QuestionCard } from './QuestionCard';

const kindLabel = {
  text: 'Sent as text',
  object: 'Sent as a JSON object',
  array: 'Sent as a JSON array',
  empty: '',
};

export function SimpleEditor() {
  const { draft, setStateText, setQuestions, issues } = usePlayground();
  const entries = Object.entries(draft.questions);
  const kind = stateKind(draft.stateText);
  const broken = looksLikeBrokenJson(draft.stateText);

  const add = (type: QuestionType) => {
    const id = uniqueKey(draft.questions, `my_${type}`);
    setQuestions({ ...draft.questions, [id]: blankQuestion(type) });
  };
  const move = (i: number, d: -1 | 1) => {
    const next = [...entries];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setQuestions(Object.fromEntries(next));
  };

  return (
    <div className="space-y-6 p-4">
      <section>
        <div className="mb-1.5 flex items-baseline justify-between">
          <SectionLabel>
            1 · <Term id="state">State</Term>
          </SectionLabel>
          <span className={broken ? 'text-[11px] text-warn' : 'text-[11px] text-faint'}>
            {broken
              ? 'Looks like JSON but does not parse. It will be sent as text'
              : kindLabel[kind]}
          </span>
        </div>
        <TextArea
          aria-label="State"
          value={draft.stateText}
          onChange={(e) => setStateText(e.target.value)}
          placeholder="Paste the text to evaluate: a pilot transmission, a METAR, a NOTAM, a fault log… or a JSON object with named fields."
          className={cx(
            'max-h-[28rem] overflow-auto!',
            kind === 'object' || kind === 'array' ? 'min-h-32 font-mono text-xs' : 'min-h-24',
          )}
        />
        <Hint>
          What the model should look at. Plain text works. A JSON object lets you name each piece
          (e.g. <code className="font-mono">clearance</code>,{' '}
          <code className="font-mono">readback</code>) and refer to it in questions.
        </Hint>
      </section>

      <section>
        <SectionLabel className="mb-1.5">
          2 · Questions{' '}
          <span className="font-normal tracking-normal normal-case">({entries.length})</span>
        </SectionLabel>
        <div className="space-y-3">
          {entries.map(([id, q], i) => (
            <QuestionCard
              key={id}
              id={id}
              question={q}
              issues={issues.filter(
                (x) => x.path === `questions.${id}` || x.path.startsWith(`questions.${id}.`),
              )}
              isFirst={i === 0}
              isLast={i === entries.length - 1}
              onMove={(d) => move(i, d)}
              onRename={(to) =>
                setQuestions(renameKey(draft.questions, id, uniqueKey(draft.questions, to)))
              }
              onChange={(nq) => setQuestions({ ...draft.questions, [id]: nq })}
              onRemove={() => {
                const next = { ...draft.questions };
                delete next[id];
                setQuestions(next);
              }}
            />
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-dashed border-line p-3">
          <div className="mb-2 text-xs text-muted">
            Add a question: pick a <Term id="primitive">primitive</Term>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(['noul', 'choice', 'score'] as const).map((t) => (
              <button
                key={t}
                onClick={() => add(t)}
                className="rounded-md border border-line bg-surface p-2.5 text-left transition-colors hover:border-accent hover:bg-accent-soft"
              >
                <TypeBadge type={t} />
                <div className="mt-1.5 text-xs font-medium">{typeBlurb[t].what}</div>
                <div className="mt-0.5 font-mono text-[11px] text-faint italic">
                  “{typeBlurb[t].example}”
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
