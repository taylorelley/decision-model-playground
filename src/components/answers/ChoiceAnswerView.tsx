import type { ChoiceAnswer, ChoiceQuestion } from '../../api/types';
import { bandCopy, confidenceBand, peakConfidence } from '../../lib/confidence';
import { asText } from '../../lib/format';
import { Disclosure } from '../ui';
import { ConfidenceBadge, Explainer, Mono, ProbBar } from './common';

export function ChoiceAnswerView({
  answer,
  question,
}: {
  answer: ChoiceAnswer;
  question?: ChoiceQuestion;
}) {
  const entries = Object.entries(answer.probabilities).sort((a, b) => b[1] - a[1]);
  const n = entries.length;
  const pmax = entries[0]?.[1] ?? 0;
  const derived = peakConfidence(entries.map(([, p]) => p));
  const band = confidenceBand(answer.confidence);
  const runnerUp = entries[1];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-lg font-semibold">{answer.choice}</span>
        <span className="text-sm text-muted tabular-nums">
          {((answer.probabilities[answer.choice] ?? pmax) * 100).toFixed(0)}%
        </span>
        <ConfidenceBadge confidence={answer.confidence} />
      </div>
      <div className="space-y-1.5">
        {entries.map(([opt, p]) => (
          <ProbBar
            key={opt}
            label={<span className="font-mono">{opt}</span>}
            sub={asText(question?.criteria?.[opt]) || undefined}
            p={p}
            highlight={opt === answer.choice}
            colorClass="bg-choice"
          />
        ))}
      </div>
      <Disclosure summary="How to read this">
        <Explainer>
          <p>
            <Mono>choice</Mono> is just the option with the highest probability. The real output is
            the whole <Mono>probabilities</Mono> distribution, which sums to 1 across your {n}{' '}
            options.
          </p>
          <p>
            <strong className="text-ink">Confidence</strong> describes the <em>shape</em> of that
            distribution: 0 when it is flat, 1 when all probability is on one option. One way to
            compute it, the peak formula, is:
            <br />
            <Mono>
              (n·p<sub>max</sub> − 1) / (n − 1) = ({n}·{pmax.toFixed(2)} − 1) / {n - 1} ={' '}
              {derived.toFixed(2)}
            </Mono>
            . The API reported <Mono>{answer.confidence.toFixed(2)}</Mono>.
          </p>
          {runnerUp && (
            <p>
              The runner-up is <Mono>{runnerUp[0]}</Mono> at {(runnerUp[1] * 100).toFixed(0)}%.{' '}
              {runnerUp[1] > 0.25
                ? 'That is close. Check whether the two options overlap, or whether the state is missing information.'
                : 'That is a clear gap.'}
            </p>
          )}
          <p>
            <strong className="text-ink">{bandCopy[band].label}:</strong> {bandCopy[band].action}{' '}
            (Teaching thresholds: ≥ 0.8 high, &lt; 0.5 low. Choose your own based on the stakes.)
          </p>
        </Explainer>
      </Disclosure>
    </div>
  );
}
