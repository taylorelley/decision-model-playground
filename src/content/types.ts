import type { Question, State } from '../api/types';

/** A request without a model; the playground supplies the selected model. */
export interface RequestTemplate {
  state: State;
  questions: Record<string, Question>;
}

export interface LessonStep {
  title: string;
  /** Paragraphs. Supports `code`, **bold**, [[glossary-term]] and [label](url). */
  body: string[];
  request: RequestTemplate;
  /** What to look at in the result. */
  notice: string[];
  /** Suggested edits to try and rerun. */
  tryThis?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  primitive: 'Noul' | 'Choice' | 'Score' | 'Concept';
  icon: string;
  steps: LessonStep[];
}

export type ExampleCategory =
  | 'Classification & Routing'
  | 'Verification & Guardrails'
  | 'Scoring & Ranking'
  | 'Agent Decisions'
  | 'Safety-critical Ops';

export interface Example {
  id: string;
  title: string;
  tagline: string;
  category: ExampleCategory;
  /** Why these primitives fit the problem. */
  why: string;
  /** How code would act on the answers. */
  inCode?: string;
  caution?: string;
  request: RequestTemplate;
}
