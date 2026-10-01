import { Link, useNavigate } from 'react-router-dom';
import { SectionLabel, TypeBadge, typeBlurb } from '../components/ui';
import { examples } from '../content/examples';
import { lessons } from '../content/lessons';
import { usePlayground } from '../store/playground';
import { LessonGrid } from './Learn';
import { useOpenExample } from './Gallery';

const FEATURED_EXAMPLES = [
  'resume-screening',
  'support-audit',
  'llm-guardrails',
  'atc-conflict-triage',
];

export function HomePage() {
  const open = useOpenExample();
  const navigate = useNavigate();
  const { setMode } = usePlayground();
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <SectionLabel>Decision model playground</SectionLabel>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">
        Learn how decision models think
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Decision models such as TypeSafe’s <span className="font-mono text-ink">jev</span> don’t
        write text. They read a <strong className="text-ink">state</strong>, answer typed{' '}
        <strong className="text-ink">questions</strong>, and return calibrated probabilities that
        your code can act on. This playground teaches you how to ask good questions and how to read
        the answers.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {(['noul', 'choice', 'score'] as const).map((t) => (
          <div key={t} className="rounded-lg border border-line bg-surface p-4">
            <TypeBadge type={t} />
            <div className="mt-2 text-sm font-medium">{typeBlurb[t].what}</div>
            <div className="mt-1 text-xs text-muted">
              {t === 'noul' && 'Returns P(yes), from 0 to 1.'}
              {t === 'choice' &&
                'Returns the top option, every option’s probability, and a confidence.'}
              {t === 'score' &&
                'Returns a probability-weighted level on your rubric, plus a confidence.'}
            </div>
          </div>
        ))}
      </div>

      <SectionLabel className="mt-12 mb-3">Walkthrough lessons</SectionLabel>
      <LessonGrid items={lessons.filter((l) => l.primitive !== 'Concept')} />
      <div className="mt-2 text-right text-xs">
        <Link to="/learn" className="text-accent hover:underline">
          All {lessons.length} lessons →
        </Link>
      </div>

      <SectionLabel className="mt-10 mb-3">Real-life use cases</SectionLabel>
      <div className="border-t border-line">
        {FEATURED_EXAMPLES.map((id) => examples.find((e) => e.id === id)!).map((e) => (
          <button
            key={e.id}
            onClick={() => open(e, 'simple')}
            className="flex w-full items-baseline gap-3 border-b border-line bg-surface px-4 py-3 text-left text-sm transition-colors hover:bg-accent-soft"
          >
            <span className="font-medium">{e.title}</span>
            <span className="text-muted">{e.tagline}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 text-right text-xs">
        <Link to="/gallery" className="text-accent hover:underline">
          All {examples.length} use cases →
        </Link>
      </div>

      <SectionLabel className="mt-10 mb-3">Two ways to build requests</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => {
            setMode('simple');
            navigate('/playground');
          }}
          className="rounded-lg border border-line bg-surface p-5 text-left transition-colors hover:border-accent"
        >
          <div className="font-semibold">Simple mode</div>
          <p className="mt-1 text-sm text-muted">
            Forms with hints for state, instructions and criteria. Answers come back in plain
            language with “How to read this” explainers.
          </p>
        </button>
        <button
          onClick={() => {
            setMode('dev');
            navigate('/playground');
          }}
          className="rounded-lg border border-line bg-surface p-5 text-left transition-colors hover:border-accent"
        >
          <div className="font-semibold">Developer mode</div>
          <p className="mt-1 text-sm text-muted">
            JSON editors like the TypeSafe console, the raw response, and copy-ready curl,
            JavaScript and Python. Both modes edit the same request.
          </p>
        </button>
      </div>
    </div>
  );
}
