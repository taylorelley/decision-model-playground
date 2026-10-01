// Request and response types for the decision model evaluation endpoint.

/** Instructions and criteria entries may be plain text or structured JSON. */
export type Structured = string | Record<string, unknown> | unknown[];

export type QuestionType = 'noul' | 'choice' | 'score';

export interface NoulQuestion {
  type: 'noul';
  instructions: Structured;
  criteria?: { true?: Structured; false?: Structured };
}

export interface ChoiceQuestion {
  type: 'choice';
  instructions: Structured;
  /** Option -> rubric description (null when no detail is needed). Max 255 options. */
  criteria: Record<string, Structured | null>;
}

export interface ScoreQuestion {
  type: 'score';
  instructions: Structured;
  /** Ordered level descriptions, lowest first. 2–10 levels. */
  criteria: Structured[];
}

export type Question = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export type State = string | Record<string, unknown> | unknown[];

export interface EvaluateRequest {
  state: State;
  model: string;
  questions: Record<string, Question>;
}

export interface NoulAnswer {
  type: 'noul';
  noul: number;
}

export interface ChoiceAnswer {
  type: 'choice';
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
}

export interface ScoreAnswer {
  type: 'score';
  score: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
  confidence: number;
}

export type Answer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export interface EvaluateResponse {
  model: string;
  answers: Record<string, Answer>;
  usage: { input_tokens: number; output_tokens: number };
}

export interface ModelInfo {
  id: string;
  description?: string;
  released?: string;
}
