import type { EvaluateRequest } from '../api/types';
import { convertQuestion } from '../components/simple/QuestionCard';
import { buildRequest, looksLikeBrokenJson, renameKey, stateKind, uniqueKey } from '../store/draft';
import { pyLiteral, toCode } from './codegen';
import { decodeRequest, encodeRequest } from './share';

const req: EvaluateRequest = {
  state: { message: 'Help! My payouts have been failing for 3 days.' },
  model: 'jev-latest',
  questions: {
    is_urgent: {
      type: 'noul',
      instructions: 'Does this convey urgency?',
      criteria: { true: 'Time-sensitive' },
    },
  },
};

describe('share links', () => {
  it('round-trips a request', () => {
    expect(decodeRequest(encodeRequest(req))).toEqual(req);
  });
  it('returns null for garbage', () => {
    expect(decodeRequest('not-a-real-link')).toBeNull();
  });
});

describe('draft helpers', () => {
  it('detects state kinds', () => {
    expect(stateKind('')).toBe('empty');
    expect(stateKind('hello')).toBe('text');
    expect(stateKind('{"a":1}')).toBe('object');
    expect(stateKind('["a"]')).toBe('array');
    expect(looksLikeBrokenJson('{"a":')).toBe(true);
  });
  it('builds structured or string state', () => {
    expect(buildRequest({ stateText: '{"a":1}', model: ' m ', questions: {} })).toEqual({
      state: { a: 1 },
      model: 'm',
      questions: {},
    });
    expect(buildRequest({ stateText: 'plain', model: 'm', questions: {} }).state).toBe('plain');
  });
  it('renames keys preserving order and makes unique keys', () => {
    expect(Object.keys(renameKey({ a: 1, b: 2, c: 3 }, 'b', 'z'))).toEqual(['a', 'z', 'c']);
    expect(uniqueKey({ my_noul: 1, my_noul_2: 1 }, 'my_noul')).toBe('my_noul_3');
  });
});

describe('convertQuestion', () => {
  it('turns score levels into choice options and back', () => {
    const choice = convertQuestion(
      { type: 'score', instructions: 'x', criteria: ['Very low', 'High!'] },
      'choice',
    );
    expect(choice).toEqual({
      type: 'choice',
      instructions: 'x',
      criteria: { very_low: null, high: null },
    });
    expect(convertQuestion(choice, 'score')).toEqual({
      type: 'score',
      instructions: 'x',
      criteria: ['very_low', 'high'],
    });
    expect(convertQuestion(choice, 'noul')).toEqual({ type: 'noul', instructions: 'x' });
  });
});

describe('codegen', () => {
  it('produces Python literals', () => {
    expect(pyLiteral({ a: null, b: true, c: [1, 'x'] })).toBe(
      '{\n    "a": None,\n    "b": True,\n    "c": [\n        1,\n        "x",\n    ],\n}',
    );
  });
  it('targets the configured base URL', () => {
    expect(toCode(req, 'curl', 'https://api.example.com')).toContain(
      'https://api.example.com/v1/systemone',
    );
    expect(toCode(req, 'python', 'x')).toContain('client.system_one(');
  });
});
