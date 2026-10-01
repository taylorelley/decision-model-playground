import { Link } from 'react-router-dom';
import { SectionLabel } from '../components/ui';
import { lessons } from '../content/lessons';

export function LearnPage() {
  const primitives = lessons.filter((l) => l.primitive !== 'Concept');
  const concepts = lessons.filter((l) => l.primitive === 'Concept');
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <SectionLabel>Lessons</SectionLabel>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Learn by running real requests</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Each lesson is a short series of steps. Every step loads a working request into the
        playground, explains what to look for, and suggests edits to try. Start with the three
        primitives using everyday examples, then move on to the concepts, taught with ATC scenarios:
        readbacks, flight plans, pilot transmissions and engineering operations.
      </p>

      <SectionLabel className="mt-10 mb-3">The three primitives</SectionLabel>
      <LessonGrid items={primitives} />
      <SectionLabel className="mt-10 mb-3">Building ATC decision systems</SectionLabel>
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
          <span className="absolute top-0 right-0 bg-ink px-1.5 py-0.5 text-[11px] font-medium text-page">
            {l.primitive}
          </span>
          <span className="text-6xl transition-transform group-hover:scale-110" aria-hidden>
            {l.icon}
          </span>
          <span className="mt-5 text-sm font-semibold">{l.title}</span>
          <span className="mt-0.5 text-sm text-muted">{l.subtitle}</span>
          <span className="mt-2 text-[11px] text-faint">{l.steps.length} steps</span>
        </Link>
      ))}
    </div>
  );
}
