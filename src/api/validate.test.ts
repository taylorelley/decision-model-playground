import { examples } from '../content/examples';
import { lessons } from '../content/lessons';
import { validateRequest } from './validate';

const base = { state: 'hello', model: 'example-model' };

describe('validateRequest', () => {
  it('accepts a minimal noul request', () => {
    expect(
      validateRequest({ ...base, questions: { q: { type: 'noul', instructions: 'Is it?' } } }),
    ).toEqual([]);
  });

  it('requires state, model and at least one question', () => {
    const paths = validateRequest({ state: '', model: '', questions: {} }).map((i) => i.path);
    expect(paths).toEqual(['state', 'model', 'questions']);
  });

  it('enforces score level bounds', () => {
    const one = validateRequest({
      ...base,
      questions: { s: { type: 'score', instructions: 'x', criteria: ['a'] } },
    });
    expect(one[0].message).toMatch(/at least 2/);
    const many = validateRequest({
      ...base,
      questions: {
        s: {
          type: 'score',
          instructions: 'x',
          criteria: Array.from({ length: 11 }, (_, i) => `l${i}`),
        },
      },
    });
    expect(many[0].message).toMatch(/at most 10/);
  });

  it('enforces choice option bounds', () => {
    const criteria = Object.fromEntries(Array.from({ length: 256 }, (_, i) => [`o${i}`, null]));
    expect(
      validateRequest({
        ...base,
        questions: { c: { type: 'choice', instructions: 'x', criteria } },
      })[0].message,
    ).toMatch(/255/);
  });

  it('rejects unknown types and stray noul criteria keys', () => {
    expect(
      validateRequest({
        ...base,
        questions: { q: { type: 'bool', instructions: 'x' } as never },
      })[0].path,
    ).toBe('questions.q.type');
    expect(
      validateRequest({
        ...base,
        questions: { q: { type: 'noul', instructions: 'x', criteria: { yes: 'a' } as never } },
      })[0].message,
    ).toMatch(/"true" and "false"/);
  });

  it.each(
    lessons.flatMap((l) => l.steps.map((s, i) => [`${l.id} step ${i + 1}`, s.request] as const)),
  )('lesson %s is a valid request', (_, req) => {
    expect(validateRequest({ ...req, model: 'example-model' })).toEqual([]);
  });

  it.each(examples.map((e) => [e.id, e.request] as const))(
    'example %s is a valid request',
    (_, req) => {
      expect(validateRequest({ ...req, model: 'example-model' })).toEqual([]);
    },
  );
});

describe('gallery content', () => {
  it('lists ATC categories before general examples', () => {
    const firstGeneral = examples.findIndex((e) => e.category === 'General');
    expect(examples[0].category).toBe('ATC operations');
    expect(examples.slice(firstGeneral).every((e) => e.category === 'General')).toBe(true);
  });

  // Stricter compatible servers accept only plain-string instructions, string score levels,
  // unique labels and at most 50 options. Gallery examples stay inside that subset.
  it.each(examples.map((e) => [e.id, e.request] as const))('example %s is portable', (_, req) => {
    for (const [id, q] of Object.entries(req.questions)) {
      expect(typeof q.instructions, `${id}.instructions`).toBe('string');
      if (q.type === 'score') {
        expect(
          q.criteria.every((c) => typeof c === 'string'),
          `${id} levels`,
        ).toBe(true);
        expect(new Set(q.criteria).size, `${id} unique levels`).toBe(q.criteria.length);
      }
      if (q.type === 'choice') expect(Object.keys(q.criteria).length).toBeLessThanOrEqual(50);
    }
  });
});
