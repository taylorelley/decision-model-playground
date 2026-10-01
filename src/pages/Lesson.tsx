import { useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { RichText } from '../components/RichText';
import { ModeToggle, Workbench } from '../components/Workbench';
import { Button, SectionLabel, cx } from '../components/ui';
import { lessonById, lessons } from '../content/lessons';
import { usePlayground } from '../store/playground';

export function LessonPage() {
  const { lessonId = '', step: stepParam = '1' } = useParams();
  const lesson = lessonById(lessonId);
  const navigate = useNavigate();
  const { load, setMode, last } = usePlayground();
  const stepIndex = Math.max(
    0,
    Math.min((lesson?.steps.length ?? 1) - 1, Number(stepParam) - 1 || 0),
  );
  const step = lesson?.steps[stepIndex];
  const enteredLesson = useRef<string | null>(null);

  useEffect(() => {
    if (!lesson || !step) return;
    if (enteredLesson.current !== lesson.id) {
      setMode('simple');
      enteredLesson.current = lesson.id;
    }
    load(step.request, { title: `${lesson.title} · step ${stepIndex + 1}` });
  }, [lesson, step, stepIndex, load, setMode]);

  if (!lesson || !step) return <Navigate to="/learn" replace />;

  const go = (i: number) => navigate(`/learn/${lesson.id}/${i + 1}`);
  const nextLesson = lessons[lessons.findIndex((l) => l.id === lesson.id) + 1];
  const isLast = stepIndex === lesson.steps.length - 1;

  return (
    <div className="flex h-full min-h-0 flex-col xl:flex-row">
      <aside className="flex shrink-0 flex-col border-line bg-surface xl:w-[26rem] xl:border-r">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-4 text-sm">
          <Link to="/learn" className="text-muted hover:text-ink">
            ← Lessons
          </Link>
          <span className="text-faint">/</span>
          <span className="truncate">{lesson.title}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-4xl" aria-hidden>
              {lesson.icon}
            </span>
            <div>
              <SectionLabel>
                {lesson.primitive === 'Concept' ? 'Concept' : `${lesson.primitive} lesson`}
              </SectionLabel>
              <h1 className="text-lg font-semibold">{lesson.title}</h1>
            </div>
          </div>

          <ol className="mb-5 flex gap-1.5" aria-label="Steps">
            {lesson.steps.map((s, i) => (
              <li key={i} className="flex-1">
                <button
                  onClick={() => go(i)}
                  title={s.title}
                  aria-current={i === stepIndex ? 'step' : undefined}
                  className={cx(
                    'h-1.5 w-full rounded-full',
                    i <= stepIndex ? 'bg-accent' : 'bg-line hover:bg-faint',
                  )}
                />
              </li>
            ))}
          </ol>

          <div className="text-xs text-muted">
            Step {stepIndex + 1} of {lesson.steps.length}
          </div>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">{step.title}</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted">
            {step.body.map((p, i) => (
              <p key={i}>
                <RichText text={p} />
              </p>
            ))}
          </div>

          <div
            className={cx(
              'mt-5 rounded-lg border p-4 transition-colors',
              last?.result ? 'border-accent/40 bg-accent-soft' : 'border-line',
            )}
          >
            <SectionLabel className="mb-2">
              {last?.result ? 'What to notice' : 'Run it, then notice'}
            </SectionLabel>
            <ul className="space-y-2 text-sm leading-relaxed text-muted">
              {step.notice.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent">→</span>
                  <span>
                    <RichText text={n} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {step.tryThis && (
            <div className="mt-4 rounded-lg border border-dashed border-line p-4">
              <SectionLabel className="mb-2">Try this</SectionLabel>
              <ul className="space-y-2 text-sm leading-relaxed text-muted">
                {step.tryThis.map((t, i) => (
                  <li key={i}>
                    ✎ <RichText text={t} />
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() =>
                  load(step.request, { title: `${lesson.title} · step ${stepIndex + 1}` })
                }
              >
                ↺ Reset this step
              </Button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="default" disabled={stepIndex === 0} onClick={() => go(stepIndex - 1)}>
              ← Back
            </Button>
            {!isLast ? (
              <Button variant="primary" onClick={() => go(stepIndex + 1)}>
                Next step →
              </Button>
            ) : nextLesson ? (
              <Button variant="primary" onClick={() => navigate(`/learn/${nextLesson.id}/1`)}>
                Next: {nextLesson.title} →
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate('/gallery')}>
                Explore use cases →
              </Button>
            )}
          </div>
        </div>
      </aside>
      <div className="flex min-h-[40rem] min-w-0 flex-1 flex-col xl:min-h-0">
        <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-4">
          <span className="text-xs text-muted">
            Edit anything and rerun. Switch to Developer to see the raw JSON.
          </span>
          <ModeToggle />
        </div>
        <div className="min-h-0 flex-1">
          <Workbench toolbar={false} />
        </div>
      </div>
    </div>
  );
}
