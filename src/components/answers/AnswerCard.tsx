import type { Answer, Question } from '../../api/types';
import { asText } from '../../lib/format';
import { TypeBadge } from '../ui';
import { ChoiceAnswerView } from './ChoiceAnswerView';
import { NoulAnswerView } from './NoulAnswerView';
import { ScoreAnswerView } from './ScoreAnswerView';

export function AnswerCard({
  id,
  answer,
  question,
}: {
  id: string;
  answer: Answer;
  question?: Question;
}) {
  return (
    <section
      className="border-b border-line px-4 py-4 last:border-b-0"
      aria-label={`Answer for ${id}`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-mono text-sm font-medium">{id}</h3>
          {question && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted italic">
              {asText(question.instructions)}
            </p>
          )}
        </div>
        {isKnown(answer) && <TypeBadge type={answer.type} />}
      </header>
      <AnswerBody answer={answer} question={question} />
    </section>
  );
}

function isKnown(a: Answer): boolean {
  return a && (a.type === 'noul' || a.type === 'choice' || a.type === 'score');
}

function AnswerBody({ answer, question }: { answer: Answer; question?: Question }) {
  switch (answer?.type) {
    case 'noul':
      return (
        <NoulAnswerView
          answer={answer}
          question={question?.type === 'noul' ? question : undefined}
        />
      );
    case 'choice':
      return (
        <ChoiceAnswerView
          answer={answer}
          question={question?.type === 'choice' ? question : undefined}
        />
      );
    case 'score':
      return (
        <ScoreAnswerView
          answer={answer}
          question={question?.type === 'score' ? question : undefined}
        />
      );
    default:
      // A compatible model may return answer types this UI does not know yet.
      return (
        <pre className="overflow-auto rounded bg-sunken p-2 font-mono text-xs">
          {JSON.stringify(answer, null, 2)}
        </pre>
      );
  }
}
