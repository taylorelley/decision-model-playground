import { useState } from 'react';
import { Button } from './ui';

export function CopyButton({
  text,
  label = 'Copy',
}: {
  text: string | (() => string);
  label?: string;
}) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(typeof text === 'function' ? text() : text);
          setState('ok');
        } catch {
          setState('fail');
        }
        setTimeout(() => setState('idle'), 1500);
      }}
    >
      {state === 'ok' ? 'Copied' : state === 'fail' ? 'Copy failed' : label}
    </Button>
  );
}
