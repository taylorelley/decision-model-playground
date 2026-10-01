import { Link } from 'react-router-dom';
import { SectionLabel } from '../components/ui';
import { lessons } from '../content/lessons';

export function LearnPage() {
  const primitives = lessons.filter((l) => l.primitive !== 'Concept');
  const concepts = lessons.filter((l) => l.primitive === 'Concept');
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Lessons</h1>

      <SectionLabel className="mt-10 mb-3">Decision types</SectionLabel>
      <LessonGrid items={primitives} />
      <SectionLabel className="mt-10 mb-3">Decision system design</SectionLabel>
      <LessonGrid items={concepts} />
    </div>
  );
}

export function LessonGrid({ items }: { items: typeof lessons }) {
  return (
    <div className="grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((l) => (
        <Link
          key={l.id}
          to={`/learn/${l.id}/1`}
          className="group relative flex flex-col items-center border-r border-b border-line bg-surface px-6 pt-10 pb-6 text-center transition-colors hover:bg-accent-soft"
        >
          <span className="absolute top-0 right-0 bg-sunken px-1.5 py-0.5 text-[11px] font-medium text-muted">
            {l.primitive}
          </span>
          <span className="text-6xl transition-transform group-hover:scale-110" aria-hidden>
            {l.icon}
          </span>
          <span className="mt-5 text-sm font-semibold">{l.title}</span>
          <span className="mt-2 text-[11px] text-faint">{l.steps.length} steps</span>
        </Link>
      ))}
    </div>
  );
}
