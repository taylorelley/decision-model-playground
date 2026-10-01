import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, config, evaluate, type EvaluateResult } from '../api/client';
import type { EvaluateRequest, Question } from '../api/types';
import { validateRequest, type Issue } from '../api/validate';
import type { RequestTemplate } from '../content/types';
import { buildRequest, draftFromTemplate, type Draft } from './draft';

export type Mode = 'simple' | 'dev';

export interface RunRecord {
  request: EvaluateRequest;
  result?: EvaluateResult;
  error?: { status?: number; hint: string; body?: unknown; message: string };
  at: number;
}

interface PlaygroundContextValue {
  draft: Draft;
  mode: Mode;
  running: boolean;
  last: RunRecord | null;
  issues: Issue[];
  setMode: (m: Mode) => void;
  setStateText: (t: string) => void;
  setModel: (m: string) => void;
  setQuestions: (q: Record<string, Question>) => void;
  load: (t: RequestTemplate, opts?: { mode?: Mode; title?: string }) => void;
  loadRequest: (r: EvaluateRequest) => void;
  clear: () => void;
  run: () => Promise<void>;
  title: string | null;
}

const STORAGE_KEY = 'dmp.playground.v1';

const EMPTY: Draft = {
  stateText: '',
  model: config.defaultModel,
  questions: {},
};

function loadPersisted(): { draft: Draft; mode: Mode; title: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as { draft: Draft; mode: Mode; title?: string | null };
      if (p?.draft && typeof p.draft.stateText === 'string')
        return {
          draft: p.draft,
          mode: p.mode === 'dev' ? 'dev' : 'simple',
          title: p.title ?? null,
        };
    }
  } catch {
    /* storage unavailable */
  }
  return { draft: EMPTY, mode: 'simple', title: null };
}

const Ctx = createContext<PlaygroundContextValue | null>(null);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadPersisted);
  const [draft, setDraft] = useState<Draft>(initial.draft);
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [title, setTitle] = useState<string | null>(initial.title);
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<RunRecord | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, mode, title }));
    } catch {
      /* storage unavailable */
    }
  }, [draft, mode, title]);

  const issues = useMemo(() => validateRequest(buildRequest(draft)), [draft]);

  const load = useCallback((t: RequestTemplate, opts?: { mode?: Mode; title?: string }) => {
    abortRef.current?.abort();
    setDraft((d) => draftFromTemplate(t, d.model || config.defaultModel));
    if (opts?.mode) setMode(opts.mode);
    setTitle(opts?.title ?? null);
    setLast(null);
    setRunning(false);
  }, []);

  const loadRequest = useCallback(
    (r: EvaluateRequest) => {
      load({ state: r.state, questions: r.questions }, { title: 'Shared request' });
      if (r.model) setDraft((d) => ({ ...d, model: r.model }));
    },
    [load],
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setDraft((d) => ({ ...EMPTY, model: d.model }));
    setTitle(null);
    setLast(null);
    setRunning(false);
  }, []);

  const run = useCallback(async () => {
    const request = buildRequest(draft);
    if (validateRequest(request).length) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setRunning(true);
    try {
      const result = await evaluate(request, { signal: ac.signal });
      if (!ac.signal.aborted) setLast({ request, result, at: Date.now() });
    } catch (e) {
      if (ac.signal.aborted) return;
      const error =
        e instanceof ApiError
          ? { status: e.status, hint: e.hint, body: e.body, message: e.message }
          : {
              hint: 'Could not reach the dev server proxy. Is `npm run dev` still running?',
              message: e instanceof Error ? e.message : String(e),
            };
      setLast({ request, error, at: Date.now() });
    } finally {
      if (!ac.signal.aborted) setRunning(false);
    }
  }, [draft]);

  const value: PlaygroundContextValue = {
    draft,
    mode,
    running,
    last,
    issues,
    title,
    setMode,
    setStateText: (stateText) => setDraft((d) => ({ ...d, stateText })),
    setModel: (model) => setDraft((d) => ({ ...d, model })),
    setQuestions: (questions) => setDraft((d) => ({ ...d, questions })),
    load,
    loadRequest,
    clear,
    run,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayground(): PlaygroundContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePlayground must be used inside PlaygroundProvider');
  return v;
}
