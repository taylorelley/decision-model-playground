export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const glossary: Record<string, GlossaryEntry> = {
  'decision-model': {
    term: 'Decision model',
    definition:
      'A model that makes fast, structured decisions instead of generating text. You send state and typed questions; it returns typed answers with probabilities your code can act on.',
  },
  state: {
    term: 'State',
    definition:
      'The content being evaluated: a string, a JSON object or an array. Every question in a request sees the same state.',
  },
  primitive: {
    term: 'Primitive',
    definition:
      'One of the three question types: Noul (yes/no probability), Choice (pick one option) and Score (rate on an ordered rubric).',
  },
  instructions: {
    term: 'Instructions',
    definition:
      'The question itself. Can be a string, or a JSON object/array that holds the question plus extra data it refers to by name in backticks.',
  },
  criteria: {
    term: 'Criteria',
    definition:
      'What each answer means. Noul: optional descriptions of yes/no. Choice: a map of option → description. Score: an ordered list of level descriptions.',
  },
  noul: {
    term: 'Noul',
    definition:
      'A yes/no question. The answer is a number from 0 (no) to 1 (yes): the probability that the answer is yes. Nouls have no confidence field; the value itself tells you how sure the model is.',
  },
  choice: {
    term: 'Choice',
    definition:
      'Pick one option from a set you define (up to 255). Returns the top option, a probability for every option, and a confidence.',
  },
  score: {
    term: 'Score',
    definition:
      'Rate the state on 2–10 ordered levels. Returns the probability-weighted level (it can land between levels), the per-level probabilities, a legend and a confidence.',
  },
  probability: {
    term: 'Probability',
    definition:
      'How likely each outcome is. In a well-calibrated model, of all the answers given 0.8, about 80% should be right.',
  },
  confidence: {
    term: 'Confidence',
    definition:
      'A 0–1 summary of how concentrated the probability distribution is. A flat distribution gives low confidence; mass on one outcome gives high confidence. Use it to decide whether to act.',
  },
  calibration: {
    term: 'Calibration',
    definition:
      'When a model says 70%, it should be right about 70% of the time. Calibrated probabilities are what make thresholds in code meaningful.',
  },
  'question-id': {
    term: 'Question id',
    definition:
      'The key you give each question. Answers come back under the same key. The key is not sent to the model, so naming it is_spam does not hint the answer.',
  },
  alias: {
    term: 'Model alias',
    definition:
      'A name like model-latest that points to a specific versioned model (e.g. model-2.1.0). Aliases can move when new versions ship. Pin the version if you have tuned thresholds against it.',
  },
  'fan-out': {
    term: 'Fan-out',
    definition:
      'Asking many questions about one state in a single request. The state is read once and the questions are evaluated in parallel, which is cheaper and faster than separate calls.',
  },
  rubric: {
    term: 'Rubric',
    definition:
      'Descriptive criteria for each option or level. Rubrics shape the answer more than bare labels like "Low/Medium/High".',
  },
};
