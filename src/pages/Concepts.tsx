import { Link } from 'react-router-dom';
import { ConfidenceExplorer } from '../components/ConfidenceExplorer';
import { config } from '../api/client';
import { SectionLabel, TypeBadge } from '../components/ui';
import { glossary } from '../content/glossary';

export function ConceptsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-sm leading-relaxed">
      <SectionLabel>Concepts</SectionLabel>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">How decision models work</h1>

      <H2 id="decision-models">Decision models are not chatbots</H2>
      <p className="text-muted">
        An LLM generates text, and you then have to parse that text and hope it is right. A{' '}
        <strong className="text-ink">decision model</strong> takes a <em>state</em> and a set of{' '}
        <em>typed questions</em> and returns typed answers with{' '}
        <strong className="text-ink">probabilities</strong>. Your code stays in control. The model
        makes narrow, fast judgments, and your code decides what to do with them.
      </p>
      <Callout>
        A decision model does not stream text, call tools or chat, so it cannot replace the LLM
        behind a chatbot or coding agent. Use it <em>inside</em> the software you build, wherever
        you need a structured decision.
      </Callout>

      <H2 id="request">Anatomy of a request</H2>
      <pre className="overflow-auto rounded-lg border border-line bg-surface p-4 font-mono text-xs">{`POST ${config.endpointPath}
{
  "model": "your-model-name",       // which model answers
  "state": "Help! My payouts have been failing for 3 days.",
  "questions": {                    // you choose the keys
    "is_urgent": {                  // ← the key is NOT shown to the model
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}`}</pre>
      <p className="mt-3 text-muted">
        The response contains <code className="font-mono">answers</code> keyed by your question ids,
        the versioned <code className="font-mono">model</code> that answered, and token{' '}
        <code className="font-mono">usage</code>.
      </p>

      <H2 id="primitives">Choosing a primitive</H2>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-xs">
          <thead className="bg-sunken text-muted">
            <tr>
              <th className="p-2.5">Type</th>
              <th className="p-2.5">Use when…</th>
              <th className="p-2.5">You get back</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            <tr>
              <td className="p-2.5">
                <TypeBadge type="noul" />
              </td>
              <td className="p-2.5">
                A statement is true or false: “is this spam?”, “did they agree?”
              </td>
              <td className="p-2.5 font-mono">noul: 0–1</td>
            </tr>
            <tr>
              <td className="p-2.5">
                <TypeBadge type="choice" />
              </td>
              <td className="p-2.5">
                Exactly one of several unordered categories applies: routing, labels, tools.
              </td>
              <td className="p-2.5 font-mono">choice, probabilities, confidence</td>
            </tr>
            <tr>
              <td className="p-2.5">
                <TypeBadge type="score" />
              </td>
              <td className="p-2.5">Answers have a natural order: severity, quality, how much.</td>
              <td className="p-2.5 font-mono">score, legend, probabilities, confidence</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-muted">
        Rule of thumb: if the options have an order, use a Score. A Choice treats “Low/Medium/High”
        as unrelated labels, while a Score knows that High is closer to Medium than to Low.
      </p>

      <H2 id="confidence">Probability vs. confidence</H2>
      <p className="mb-4 text-muted">
        <strong className="text-ink">Probability</strong> is about one outcome: “70% that it’s
        billing”. <strong className="text-ink">Confidence</strong> is about the whole distribution:
        is the probability concentrated on one option, or spread out? Drag the sliders to see the
        difference.
      </p>
      <ConfidenceExplorer />
      <p className="mt-4 text-muted">
        A useful starting pattern divides confidence into three ranges:{' '}
        <strong className="text-good">high</strong>, act automatically;{' '}
        <strong className="text-warn">medium</strong>, confirm or flag for review;{' '}
        <strong className="text-bad">low</strong>, don’t act, so route to a human or ask for more
        context. Set the thresholds by risk. A read-only lookup can act at a lower confidence than a
        money transfer.
      </p>

      <H2 id="patterns">Patterns</H2>
      <ul className="space-y-2 text-muted">
        <li>
          <strong className="text-ink">Speculative fan-out:</strong> ask many questions in one call,
          including ones you might not need. The state is read once.
        </li>
        <li>
          <strong className="text-ink">Confidence-gated routing:</strong> the answer tells you what;
          confidence tells you whether to act.
        </li>
        <li>
          <strong className="text-ink">Composite scoring:</strong> split a broad judgment into
          atomic scores and combine them with weights in code.
        </li>
        <li>
          <strong className="text-ink">Intent routing:</strong> classify a request and send it to
          deterministic code, a specialist LLM or a human.
        </li>
      </ul>
      <p className="mt-3 text-muted">
        See them in action in the{' '}
        <Link to="/gallery" className="text-accent hover:underline">
          use-case gallery
        </Link>
        .
      </p>

      <H2 id="tips">Writing good questions</H2>
      <ul className="list-disc space-y-1.5 pl-5 text-muted">
        <li>
          Keep each question narrow and atomic. Several small questions beat one compound question.
        </li>
        <li>
          Put the content in the state and the judgment in the question. Name state fields and refer
          to them in backticks.
        </li>
        <li>
          Describe what each option or level <em>looks like</em>, not just its label.
        </li>
        <li>
          Give the model an honest way out, such as an <code className="font-mono">unclear</code>{' '}
          option, when the state may not contain the answer.
        </li>
        <li>
          Pin a specific model version once you tune thresholds against it. Aliases like{' '}
          <code className="font-mono">-latest</code> can move to a new version without warning.
        </li>
      </ul>

      <H2 id="glossary">Glossary</H2>
      <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
        {Object.entries(glossary).map(([id, g]) => (
          <div key={id} id={`g-${id}`} className="grid gap-1 p-3 sm:grid-cols-[10rem_1fr]">
            <dt className="font-medium">{g.term}</dt>
            <dd className="text-muted">{g.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-10 mb-3 scroll-mt-6 text-lg font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-accent/30 bg-accent-soft p-3 text-muted">
      {children}
    </div>
  );
}
