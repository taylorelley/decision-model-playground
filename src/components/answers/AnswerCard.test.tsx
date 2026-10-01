import { render, screen } from '@testing-library/react';
import { AnswerCard } from './AnswerCard';

// Sample responses from https://docs.typesafe.ai/api.md
describe('AnswerCard', () => {
  it('renders a noul answer as a probability', () => {
    render(
      <AnswerCard
        id="is_urgent"
        answer={{ type: 'noul', noul: 0.95 }}
        question={{ type: 'noul', instructions: 'Does this convey urgency?' }}
      />,
    );
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('Almost certainly yes')).toBeInTheDocument();
  });

  it('renders a choice answer with all options and confidence', () => {
    render(
      <AnswerCard
        id="department"
        answer={{
          type: 'choice',
          choice: 'billing',
          probabilities: { billing: 0.88, technical: 0.12, sales: 0 },
          confidence: 0.81,
        }}
      />,
    );
    expect(screen.getAllByText('billing').length).toBeGreaterThan(0);
    expect(screen.getByText('technical')).toBeInTheDocument();
    expect(screen.getByText(/0\.81/)).toBeInTheDocument();
  });

  it('renders a score answer between levels', () => {
    render(
      <AnswerCard
        id="frustration"
        answer={{
          type: 'score',
          score: 1.05,
          legend: { '0': 'Calm', '1': 'Frustrated', '2': 'Very angry' },
          probabilities: { '0': 0, '1': 0.95, '2': 0.05 },
          confidence: 0.92,
        }}
      />,
    );
    expect(screen.getByText('1.05')).toBeInTheDocument();
    expect(screen.getByText('“Frustrated”')).toBeInTheDocument();
  });

  it('falls back to raw JSON for unknown answer types', () => {
    render(<AnswerCard id="x" answer={{ type: 'rank', order: ['a'] } as never} />);
    expect(screen.getByText(/"rank"/)).toBeInTheDocument();
  });
});
