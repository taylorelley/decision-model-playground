// Helpers for reading answers. The choice confidence formula mirrors the interactive
// explorer in https://docs.typesafe.ai/confidence.md:
//   confidence = (n * p_max - 1) / (n - 1)
// i.e. 0 when the distribution is uniform, 1 when all mass is on one option.
// The API returns `confidence` itself; we recompute it only to explain it.

export function peakConfidence(probabilities: number[]): number {
  const n = probabilities.length;
  if (n < 2) return 1;
  const peak = Math.max(...probabilities);
  return Math.max(0, Math.min(1, (n * peak - 1) / (n - 1)));
}

/** Expected level index: Σ level · p(level). This is what a Score's `score` field reports. */
export function expectedLevel(probabilities: Record<string, number>): number {
  return Object.entries(probabilities).reduce((sum, [level, p]) => sum + Number(level) * p, 0);
}

export type ConfidenceBand = 'high' | 'medium' | 'low';

/** The three-path pattern from the docs. Thresholds are a teaching default, not a rule. */
export function confidenceBand(confidence: number, high = 0.8, low = 0.5): ConfidenceBand {
  if (confidence >= high) return 'high';
  if (confidence >= low) return 'medium';
  return 'low';
}

export const bandCopy: Record<ConfidenceBand, { label: string; action: string }> = {
  high: { label: 'Confident', action: 'Safe to act automatically (for low-stakes actions).' },
  medium: { label: 'Fairly sure', action: 'Proceed with caution: confirm or flag for review.' },
  low: { label: 'Unsure', action: 'Do not act: route to a human or ask for more context.' },
};

/** Plain-language reading of a noul value (probability of yes). */
export function describeNoul(p: number): string {
  if (p >= 0.95) return 'Almost certainly yes';
  if (p >= 0.8) return 'Very likely yes';
  if (p >= 0.6) return 'Leaning yes';
  if (p > 0.4) return 'Toss-up';
  if (p > 0.2) return 'Leaning no';
  if (p > 0.05) return 'Very likely no';
  return 'Almost certainly no';
}
