import { useState } from 'react';
import { encodeRequest } from '../lib/share';
import { buildRequest } from '../store/draft';
import { usePlayground, type Mode } from '../store/playground';
import { DevEditors } from './dev/DevEditors';
import { ResponsePanel } from './ResponsePanel';
import { RunBar } from './RunBar';
import { SimpleEditor } from './simple/SimpleEditor';
import { Button, Tabs } from './ui';

export function ModeToggle() {
  const { mode, setMode } = usePlayground();
  return (
    <Tabs<Mode>
      value={mode}
      onChange={setMode}
      options={[
        { value: 'simple', label: 'Simple', title: 'Form-based editor with explanations' },
        { value: 'dev', label: 'Developer', title: 'Raw JSON editors and the raw response' },
      ]}
    />
  );
}

/** The editor + response surface, shared by the Playground and Lesson pages. */
export function Workbench({ toolbar = true }: { toolbar?: boolean }) {
  const { mode, draft, clear, title } = usePlayground();
  const [shared, setShared] = useState(false);

  const share = async () => {
    const url = `${location.origin}${location.pathname}#/playground?r=${encodeRequest(buildRequest(draft))}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link', url);
    }
    setShared(true);
    setTimeout(() => setShared(false), 1500);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {toolbar && (
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-surface px-4">
          <span className="truncate text-sm text-muted">
            Playground{title && <span className="text-ink"> / {title}</span>}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <ModeToggle />
            <Button size="sm" variant="ghost" onClick={clear}>
              Clear
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={share}
              title="Copy a link that reopens this request (stored in the URL, not on a server)"
            >
              {shared ? 'Link copied' : 'Share'}
            </Button>
          </div>
        </div>
      )}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="flex min-h-[28rem] flex-col border-line lg:min-h-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-auto">
            {mode === 'dev' ? <DevEditors /> : <SimpleEditor />}
          </div>
          <RunBar />
        </div>
        <div className="min-h-[24rem] border-t border-line lg:min-h-0 lg:border-t-0">
          <ResponsePanel variant={mode} />
        </div>
      </div>
    </div>
  );
}
