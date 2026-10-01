import type { Question, QuestionType } from '../api/types';

/** Which primitives a request uses, in a stable order. */
export function primitivesUsed(questions: Record<string, Question>): QuestionType[] {
  const used = new Set(Object.values(questions).map((q) => q.type));
  return (['noul', 'choice', 'score'] as const).filter((t) => used.has(t));
}
