import { useMemo, useState } from 'react';
import { config } from '../api/client';
import { buildRequest } from '../store/draft';
import { usePlayground } from '../store/playground';
import { AnswerCard } from './answers/AnswerCard';
import { JsonEditor } from './JsonEditor';
import { QuestionSummary } from './QuestionSummary';
import { RequestCode } from './RequestCode';
import { Tabs, cx } from './ui';

type Tab = 'preview' | 'raw' | 'code';

export function ResponsePanel({ variant }: { variant: 'simple' | 'dev' }) {
  const { draft, last, running } = usePlayground();
  const [tab, setTab] = useState<Tab>('preview');
  const request = useMemo(() => buildRequest(draft), [draft]);
  const stale = !!last && JSON.stringify(last.request) !== JSON.stringify(request);
  const response = last?.result?.response;
  const questions = last?.request.questions ?? draft.questions;

  const status = running
    ? 'Running…'
    : last?.error
      ? `Error${last.error.status ? ` ${last.error.status}` : ''}`
      : response
        ? `${response.model} · ${last!.result!.latencyMs} ms · ${response.usage?.input_tokens ?? '?'} input tokens`
        : 'Run request to see output';

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-1.5">
        <span className="text-sm font-medium">Response</span>
        {variant === 'dev' ? (
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: 'preview', label: 'Preview' },
              { value: 'raw', label: 'Raw JSON', title: 'The exact response body' },
              { value: 'code', label: 'Code', title: 'This request as curl, JavaScript or Python' },
            ]}
          />
        ) : null}
        <span className={cx('text-xs', last?.error ? 'text-bad' : 'text-muted')} aria-live="polite">
          {status}
        </span>
        {stale && !running && (
          <span
            className="ml-auto rounded bg-warn/10 px-1.5 py-0.5 text-[11px] text-warn"
            title="Run again to see the effect of your edits"
          >
            Inputs changed since this run
          </span>
        )}
      </div>

      <div
        className={cx('min-h-0 flex-1 overflow-auto', running && 'opacity-60 transition-opacity')}
      >
        {tab === 'code' && variant === 'dev' ? (
          <RequestCode request={request} />
        ) : tab === 'raw' && variant === 'dev' ? (
          <div className="h-full">
            <JsonEditor
              readOnly
              ariaLabel="Raw response JSON"
              value={
                last
                  ? JSON.stringify(response ?? last.error?.body ?? last.error, null, 2)
                  : '// Run a request to see the raw response'
              }
            />
          </div>
        ) : (
          <>
            {last?.error && <ErrorBox error={last.error} />}
            {response ? (
              <>
                {Object.entries(response.answers ?? {}).map(([id, a]) => (
                  <AnswerCard key={id} id={id} answer={a} question={questions[id]} />
                ))}
                <UsageFooter
                  model={response.model}
                  requested={last!.request.model}
                  usage={response.usage}
                  latency={last!.result!.latencyMs}
                  attempts={last!.result!.attempts}
                />
              </>
            ) : Object.keys(draft.questions).length ? (
              <>
                <div className="flex items-center justify-between border-b border-line bg-sunken/60 px-4 py-2 text-xs text-muted">
                  <span>Questions in this request</span>
                  <span>Answer type</span>
                </div>
                {Object.entries(draft.questions).map(([id, q]) => (
                  <QuestionSummary key={id} id={id} question={q} />
                ))}
              </>
            ) : (
              <EmptyState />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ErrorBox({
  error,
}: {
  error: NonNullable<ReturnType<typeof usePlayground>['last']>['error'];
}) {
  if (!error) return null;
  return (
    <div role="alert" className="m-4 rounded-md border border-bad/30 bg-bad/5 p-3 text-sm">
      <div className="font-medium text-bad">
        {error.status ? `HTTP ${error.status}` : 'Request failed'}: {error.hint}
      </div>
      {error.body != null && error.body !== '' && (
        <pre className="mt-2 max-h-60 overflow-auto font-mono text-xs whitespace-pre-wrap text-muted">
          {typeof error.body === 'string' ? error.body : JSON.stringify(error.body, null, 2)}
        </pre>
      )}
      {!config.hasKey && (error.status === 401 || error.status === 403) && (
        <p className="mt-2 text-xs text-muted">
          Copy <code className="font-mono">.env.example</code> to{' '}
          <code className="font-mono">.env</code>, set{' '}
          <code className="font-mono">DECISION_API_KEY</code> and restart the playground server.
        </p>
      )}
    </div>
  );
}

function UsageFooter({
  model,
  requested,
  usage,
  latency,
  attempts,
}: {
  model: string;
  requested: string;
  usage?: { input_tokens: number; output_tokens: number };
  latency: number;
  attempts: number;
}) {
  return (
    <div className="space-y-1 border-t border-line bg-sunken/50 px-4 py-3 text-xs text-muted">
      <div>
        Answered by <span className="font-mono text-ink">{model}</span>
        {requested !== model && (
          <>
            {' '}
            (you asked for <span className="font-mono">{requested}</span>, an alias that currently
            points to this version. Pin the version if you tune thresholds against it.)
          </>
        )}
      </div>
      {usage && (
        <div>
          {usage.input_tokens} input tokens · {usage.output_tokens} output tokens · {latency} ms
          {attempts > 1 && ` · ${attempts} attempts (retried after rate limiting)`}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-sm text-muted">
      <p>Add a state and at least one question, then run the request.</p>
      <p className="mt-1 text-xs text-faint">
        Or load a lesson or a gallery example to start from a working request.
      </p>
    </div>
  );
}
