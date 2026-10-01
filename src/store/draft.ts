import type { EvaluateRequest, Question, State } from '../api/types';
import type { RequestTemplate } from '../content/types';
import { parseLoose } from '../lib/format';

/** The editable request shared by simple and dev mode. */
export interface Draft {
  /** Raw state text. Valid JSON objects/arrays are sent as structured state; anything else as a string. */
  stateText: string;
  model: string;
  questions: Record<string, Question>;
}

export function stateToText(state: State): string {
  return typeof state === 'string' ? state : JSON.stringify(state, null, 2);
}

export function parseState(text: string): State {
  return parseLoose(text) as State;
}

export type StateKind = 'text' | 'object' | 'array' | 'empty';

export function stateKind(text: string): StateKind {
  if (!text.trim()) return 'empty';
  const s = parseState(text);
  if (Array.isArray(s)) return 'array';
  if (typeof s === 'object' && s !== null) return 'object';
  return 'text';
}

/** True when the text looks like JSON (starts with { or [) but does not parse. */
export function looksLikeBrokenJson(text: string): boolean {
  const t = text.trim();
  return (t.startsWith('{') || t.startsWith('[')) && typeof parseState(text) === 'string';
}

export function draftFromTemplate(t: RequestTemplate, model: string): Draft {
  return { stateText: stateToText(t.state), model, questions: structuredClone(t.questions) };
}

export function buildRequest(d: Draft): EvaluateRequest {
  return { state: parseState(d.stateText), model: d.model.trim(), questions: d.questions };
}

/** Rename a key while preserving order. */
export function renameKey<T>(obj: Record<string, T>, from: string, to: string): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(obj)) out[k === from ? to : k] = v;
  return out;
}

export function uniqueKey(obj: Record<string, unknown>, base: string): string {
  if (!(base in obj)) return base;
  let i = 2;
  while (`${base}_${i}` in obj) i++;
  return `${base}_${i}`;
}

export function blankQuestion(type: Question['type']): Question {
  switch (type) {
    case 'noul':
      return { type: 'noul', instructions: '' };
    case 'choice':
      return { type: 'choice', instructions: '', criteria: { option_a: null, option_b: null } };
    case 'score':
      return { type: 'score', instructions: '', criteria: ['Low', 'Medium', 'High'] };
  }
}
