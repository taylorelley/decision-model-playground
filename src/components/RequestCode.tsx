import { useState } from 'react';
import { config } from '../api/client';
import type { EvaluateRequest } from '../api/types';
import { toCode, type CodeLang } from '../lib/codegen';
import { CopyButton } from './CopyButton';
import { Tabs } from './ui';

export function RequestCode({ request }: { request: EvaluateRequest }) {
  const [lang, setLang] = useState<CodeLang>('curl');
  const code = toCode(
    request,
    lang,
    config.baseUrl ? `${config.baseUrl}${config.endpointPath}` : '',
  );
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <Tabs
          value={lang}
          onChange={setLang}
          options={[
            { value: 'curl', label: 'curl' },
            { value: 'javascript', label: 'JavaScript' },
            { value: 'python', label: 'Python' },
          ]}
        />
        <CopyButton text={code} />
      </div>
      <p className="border-b border-line px-4 py-2 text-xs text-muted">
        The same request you are about to send, ready to paste into your own code. The playground
        sends it through the local dev proxy, which adds your key.
      </p>
      <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
