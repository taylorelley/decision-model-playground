import { confidenceBand, describeNoul, expectedLevel, peakConfidence } from './confidence';

describe('peakConfidence', () => {
  it('is 0 for a uniform distribution and 1 for a certain one', () => {
    expect(peakConfidence([1 / 3, 1 / 3, 1 / 3])).toBeCloseTo(0);
    expect(peakConfidence([1, 0, 0])).toBe(1);
  });
  it('matches the docs explorer default (90/6/4 → 0.85)', () => {
    expect(peakConfidence([0.9, 0.06, 0.04])).toBeCloseTo(0.85);
  });
  it('is close to the API examples in the docs', () => {
    expect(peakConfidence([0.88, 0.12, 0])).toBeCloseTo(0.81, 1);
    expect(peakConfidence([0, 0.95, 0.05])).toBeCloseTo(0.92, 1);
  });
  it('treats a two-way split of three options as low confidence', () => {
    expect(peakConfidence([0.5, 0.5, 0])).toBeCloseTo(0.25);
  });
});

describe('expectedLevel', () => {
  it('reproduces the docs score example', () => {
    expect(expectedLevel({ '0': 0, '1': 0.95, '2': 0.05 })).toBeCloseTo(1.05);
  });
});

describe('bands and descriptions', () => {
  it('bands confidence', () => {
    expect(confidenceBand(0.9)).toBe('high');
    expect(confidenceBand(0.6)).toBe('medium');
    expect(confidenceBand(0.2)).toBe('low');
  });
  it('describes noul values', () => {
    expect(describeNoul(0.97)).toMatch(/certainly yes/);
    expect(describeNoul(0.5)).toBe('Toss-up');
    expect(describeNoul(0.01)).toMatch(/certainly no/);
  });
});
