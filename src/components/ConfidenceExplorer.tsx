import { useState } from 'react';
import { bandCopy, confidenceBand, peakConfidence } from '../lib/confidence';

const OPTIONS = ['A', 'B', 'C'];

/** Drag probabilities around and watch confidence change. Mirrors the explorer in the TypeSafe docs. */
export function ConfidenceExplorer() {
  const [probs, setProbs] = useState([90, 6, 4]);

  const change = (i: number, value: number) =>
    setProbs((cur) => {
      const others = [0, 1, 2].filter((j) => j !== i);
      const remaining = 100 - value;
      const prevRemaining = cur[others[0]] + cur[others[1]];
      const next = [...cur];
      next[i] = value;
      next[others[0]] =
        prevRemaining > 0 ? (remaining * cur[others[0]]) / prevRemaining : remaining / 2;
      next[others[1]] = remaining - next[others[0]];
      return next;
    });

  const confidence = peakConfidence(probs.map((p) => p / 100));
  const max = Math.max(...probs);
  const band = confidenceBand(confidence);

  return (
    <section
      aria-label="Confidence explorer"
      className="rounded-lg border border-line bg-surface p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
            Choice question with three options
          </div>
          <div className="mt-1 font-semibold">
            See how the probability distribution changes confidence
          </div>
        </div>
        <div className="text-right" aria-live="polite">
          <div className="text-xs text-muted">Confidence</div>
          <output className="block text-3xl font-semibold text-accent tabular-nums">
            {confidence.toFixed(2)}
          </output>
          <div className="text-xs text-muted">{bandCopy[band].label}</div>
        </div>
      </div>

      <div
        className="my-6 flex h-40 items-end justify-around gap-6 border-b border-line px-6"
        aria-hidden
      >
        {OPTIONS.map((o, i) => (
          <div key={o} className="flex h-full w-1/5 flex-col items-center justify-end">
            <span className="mb-1 text-xs font-semibold tabular-nums">{probs[i].toFixed(0)}%</span>
            <div
              className={
                probs[i] === max ? 'w-full rounded-t bg-accent' : 'w-full rounded-t bg-faint/50'
              }
              style={{ height: `${probs[i]}%` }}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {OPTIONS.map((o, i) => (
          <label key={o} className="flex items-center gap-3 text-sm">
            <span className="w-4 font-semibold">{o}</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(probs[i])}
              onChange={(e) => change(i, Number(e.target.value))}
              className="flex-1 accent-[var(--accent)]"
              aria-label={`Probability of option ${o}`}
            />
            <span className="w-10 text-right text-xs tabular-nums">{probs[i].toFixed(0)}%</span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ['Certain', [100, 0, 0]],
          ['Confident', [90, 6, 4]],
          ['Two-way split', [50, 50, 0]],
          ['Uniform', [100 / 3, 100 / 3, 100 / 3]],
        ].map(([label, p]) => (
          <button
            key={label as string}
            onClick={() => setProbs(p as number[])}
            className="rounded border border-line px-2 py-1 text-xs text-muted hover:bg-sunken hover:text-ink"
          >
            {label as string}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        <code className="font-mono text-ink">
          confidence = (n·p<sub>max</sub> − 1) / (n − 1) = (3·{(max / 100).toFixed(2)} − 1) / 2 ={' '}
          {confidence.toFixed(2)}
        </code>
        <br />A flat distribution gives 0 and all mass on one option gives 1. A 50/50 split between
        two of the three options gives 0.25, even though the top option has 50% probability.
        Probability describes one option; confidence describes the shape of the whole distribution.
      </p>
    </section>
  );
}
