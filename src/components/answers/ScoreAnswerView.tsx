import type { ScoreAnswer, ScoreQuestion } from '../../api/types';
import { bandCopy, confidenceBand } from '../../lib/confidence';
import { asText } from '../../lib/format';
import { Disclosure } from '../ui';
import { ConfidenceBadge, Explainer, Mono, ProbBar } from './common';

export function ScoreAnswerView({
  answer,
  question,
}: {
  answer: ScoreAnswer;
  question?: ScoreQuestion;
}) {
  const source =
    answer.legend && Object.keys(answer.legend).length ? answer.legend : answer.probabilities;
  const levels = Object.keys(source)
    .map(Number)
    .sort((a, b) => a - b);
  const max = levels.length ? levels[levels.length - 1] : 1;
  const nearest = Math.round(answer.score);
  const label = (l: number) =>
    answer.legend?.[String(l)] || asText(question?.criteria?.[l]) || String(l);
  const prob = (l: number) => answer.probabilities[String(l)] ?? 0;
  const band = confidenceBand(answer.confidence);
  const terms = levels.filter((l) => prob(l) > 0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-semibold tabular-nums">{answer.score.toFixed(2)}</span>
        <span className="text-sm text-muted">
          of 0–{max} · closest to <span className="text-ink">“{label(nearest)}”</span>
        </span>
        <ConfidenceBadge confidence={answer.confidence} />
      </div>

      <div className="px-1">
        <div className="relative h-6">
          <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-line" />
          {levels.map((l) => (
            <div
              key={l}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-line bg-surface"
              style={{ left: `${(l / (max || 1)) * 100}%` }}
            />
          ))}
          <div
            className="absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-score shadow transition-[left] duration-500"
            style={{ left: `${(answer.score / (max || 1)) * 100}%` }}
            title={`score ${answer.score.toFixed(2)}`}
          />
        </div>
        <div className="flex justify-between text-[11px] text-faint tabular-nums">
          {levels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {levels.map((l) => (
          <ProbBar
            key={l}
            label={
              <>
                <span className="mr-1.5 font-mono text-faint">{l}</span>
                {label(l)}
              </>
            }
            sub={label(l)}
            p={prob(l)}
            highlight={l === nearest}
            colorClass="bg-score"
          />
        ))}
      </div>

      <Disclosure summary="How to read this">
        <Explainer>
          <p>
            <Mono>score</Mono> is the{' '}
            <strong className="text-ink">probability-weighted average level</strong>, so it can land
            between levels:
            <br />
            <Mono>
              {terms.length ? terms.map((l) => `${l}×${prob(l).toFixed(2)}`).join(' + ') : '0'} ≈{' '}
              {answer.score.toFixed(2)}
            </Mono>
          </p>
          <p>
            Levels are numbered from 0 in the order you listed them, and <Mono>legend</Mono> maps
            each number back to your description. A score that sits between two levels usually means
            the model is split between them. Check the bars.
          </p>
          <p>
            <strong className="text-ink">Confidence {answer.confidence.toFixed(2)}</strong> measures
            how concentrated the level probabilities are. When confidence is low, the levels may be
            ambiguous or overlap, or the state may not contain enough to go on.{' '}
            {bandCopy[band].action}
          </p>
        </Explainer>
      </Disclosure>
    </div>
  );
}
