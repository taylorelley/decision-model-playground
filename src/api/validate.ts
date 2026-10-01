import type { EvaluateRequest, Question } from './types';

export interface Issue {
  path: string;
  message: string;
}

const KEY_RE = /^[A-Za-z0-9_.-]+$/;

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v as object).length === 0;
  return false;
}

export function validateQuestion(id: string, q: unknown): Issue[] {
  const issues: Issue[] = [];
  const at = (m: string, sub = '') => issues.push({ path: `questions.${id}${sub}`, message: m });
  if (!KEY_RE.test(id)) at('Use letters, numbers, _ . or - in question ids.');
  if (!q || typeof q !== 'object') {
    at('Each question must be an object.');
    return issues;
  }
  const question = q as Partial<Question> & { type?: string };
  if (!['noul', 'choice', 'score'].includes(question.type ?? '')) {
    at('type must be "noul", "choice" or "score".', '.type');
    return issues;
  }
  if (isEmpty(question.instructions)) at('instructions are required.', '.instructions');

  if (question.type === 'choice') {
    const c = question.criteria;
    if (!c || typeof c !== 'object' || Array.isArray(c))
      at('Choice criteria must be an object of option → description.', '.criteria');
    else {
      const n = Object.keys(c).length;
      if (n < 2) at('A Choice needs at least 2 options.', '.criteria');
      if (n > 255) at('A Choice can have at most 255 options.', '.criteria');
      if (Object.keys(c).some((k) => k.trim() === ''))
        at('Option names cannot be blank.', '.criteria');
    }
  }
  if (question.type === 'score') {
    const c = question.criteria;
    if (!Array.isArray(c)) at('Score criteria must be an ordered array of levels.', '.criteria');
    else {
      if (c.length < 2) at('A Score needs at least 2 levels.', '.criteria');
      if (c.length > 10) at('A Score can have at most 10 levels.', '.criteria');
      if (c.some(isEmpty)) at('Level descriptions cannot be blank.', '.criteria');
    }
  }
  if (question.type === 'noul' && question.criteria != null) {
    const c = question.criteria;
    if (typeof c !== 'object' || Array.isArray(c))
      at('Noul criteria (optional) must be an object with "true"/"false".', '.criteria');
    else if (Object.keys(c).some((k) => k !== 'true' && k !== 'false'))
      at('Noul criteria only accepts the keys "true" and "false".', '.criteria');
  }
  return issues;
}

export function validateRequest(req: Partial<EvaluateRequest>): Issue[] {
  const issues: Issue[] = [];
  if (isEmpty(req.state))
    issues.push({
      path: 'state',
      message: 'State is required: give the model something to evaluate.',
    });
  if (!req.model || !req.model.trim()) issues.push({ path: 'model', message: 'Pick a model.' });
  const qs = req.questions;
  if (!qs || typeof qs !== 'object' || Array.isArray(qs) || Object.keys(qs).length === 0)
    issues.push({ path: 'questions', message: 'Add at least one question.' });
  else for (const [id, q] of Object.entries(qs)) issues.push(...validateQuestion(id, q));
  return issues;
}
