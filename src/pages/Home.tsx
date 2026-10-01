import { Link, useNavigate } from 'react-router-dom';
import { SectionLabel, TypeBadge, typeBlurb } from '../components/ui';
import { examples } from '../content/examples';
import { lessons } from '../content/lessons';
import { usePlayground } from '../store/playground';
import { LessonGrid } from './Learn';
import { useOpenExample } from './Gallery';

const FEATURED_EXAMPLES = [
  'atc-conflict-triage',
  'cpdlc-oceanic',
  'surveillance-alert-triage',
  'occurrence-report',
  'change-risk',
];

export function HomePage() {
  const open = useOpenExample();
  const navigate = useNavigate();
  const { setMode } = usePlayground();
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">Decision models</h1>

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

      <SectionLabel className="mt-12 mb-3">Lessons</SectionLabel>
      <LessonGrid items={lessons.filter((l) => l.primitive !== 'Concept')} />
      <div className="mt-2 text-right text-xs">
        <Link to="/learn" className="text-accent hover:underline">
          All {lessons.length} lessons →
        </Link>
      </div>

      <SectionLabel className="mt-10 mb-3">Use cases</SectionLabel>
      <div className="border-t border-line">
        {FEATURED_EXAMPLES.map((id) => examples.find((e) => e.id === id)!).map((e) => (
          <button
            key={e.id}
            onClick={() => open(e, 'simple')}
            className="flex w-full items-baseline gap-3 border-b border-line bg-surface px-4 py-3 text-left text-sm transition-colors hover:bg-accent-soft"
          >
            <span className="font-medium">{e.title}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 text-right text-xs">
        <Link to="/gallery" className="text-accent hover:underline">
          All {examples.length} use cases →
        </Link>
      </div>

      <SectionLabel className="mt-10 mb-3">Request editors</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => {
            setMode('simple');
            navigate('/playground');
          }}
          className="rounded-lg border border-line bg-surface p-5 text-left transition-colors hover:border-accent"
        >
          <div className="font-semibold">Simple mode</div>
        </button>
        <button
          onClick={() => {
            setMode('dev');
            navigate('/playground');
          }}
          className="rounded-lg border border-line bg-surface p-5 text-left transition-colors hover:border-accent"
        >
          <div className="font-semibold">Developer mode</div>
        </button>
      </div>
    </div>
  );
}
