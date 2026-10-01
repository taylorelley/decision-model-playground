import type { NoulAnswer, NoulQuestion } from '../../api/types';
import { describeNoul } from '../../lib/confidence';
import { asText } from '../../lib/format';
import { Disclosure } from '../ui';
import { Explainer, Mono } from './common';

export function NoulAnswerView({
  answer,
  question,
}: {
  answer: NoulAnswer;
  question?: NoulQuestion;
}) {
  const p = answer.noul;
  const certainty = Math.abs(p - 0.5) * 2;
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold tabular-nums">{(p * 100).toFixed(0)}%</span>
        <span className="text-sm text-muted">{describeNoul(p)}</span>
      </div>
      <div>
        <div className="relative h-2.5 rounded-full bg-gradient-to-r from-bad/30 via-sunken to-good/40">
          <div
            className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-noul shadow transition-[left] duration-500"
            style={{ left: `${p * 100}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-faint">
          <span title={asText(question?.criteria?.false)}>
            0 · no
            {question?.criteria?.false ? ` (${truncate(asText(question.criteria.false))})` : ''}
          </span>
          <span title={asText(question?.criteria?.true)}>
            {question?.criteria?.true ? `(${truncate(asText(question.criteria.true))}) ` : ''}yes ·
            1
          </span>
        </div>
      </div>
      <Disclosure summary="How to read this">
        <Explainer>
          <p>
            A noul is the <strong className="text-ink">probability that the answer is yes</strong>:{' '}
            <Mono>noul = {p.toFixed(3)}</Mono>. It is not a boolean. Your code picks the threshold,
            and higher-stakes actions call for higher thresholds (e.g.{' '}
            <Mono>if (noul &gt; 0.8) act()</Mono>).
          </p>
          <p>
            Nouls have no <Mono>confidence</Mono> field because the value itself carries the
            certainty. Distance from 0.5 shows how sure the model is. Here it is{' '}
            {(certainty * 100).toFixed(0)}% of the way from a coin flip to certain.
          </p>
          <p>
            For a well-<strong className="text-ink">calibrated</strong> model, about{' '}
            {(p * 100).toFixed(0)}% of answers given {p.toFixed(2)} should turn out to be
            &quot;yes&quot;. Check this on your own labelled data before relying on it.
          </p>
        </Explainer>
      </Disclosure>
    </div>
  );
}

function truncate(s: string, n = 40) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
