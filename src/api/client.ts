import type { EvaluateRequest, EvaluateResponse, ModelInfo } from './types';

/** Requests go to the Vite proxy, which forwards to TYPESAFE_BASE_URL with the key attached. */
const API_ROOT = '/api/v1';

export interface RuntimeConfig {
  hasKey: boolean;
  baseUrl: string;
  defaultModel: string;
}

/** Non-secret settings. Starts from build-time values; `loadRuntimeConfig` refreshes them. */
export const config: RuntimeConfig = {
  hasKey: __HAS_KEY__,
  baseUrl: __BASE_URL__,
  defaultModel: __DEFAULT_MODEL__,
};

/** Fetch the settings of the server we are running on (see vite.config.ts). */
export async function loadRuntimeConfig(): Promise<void> {
  try {
    const res = await fetch('/__playground/config', { cache: 'no-store' });
    if (!res.ok) return;
    const c = (await res.json()) as Partial<RuntimeConfig>;
    if (typeof c.hasKey === 'boolean') config.hasKey = c.hasKey;
    if (typeof c.baseUrl === 'string') config.baseUrl = c.baseUrl;
    if (typeof c.defaultModel === 'string') config.defaultModel = c.defaultModel;
  } catch {
    /* keep build-time values */
  }
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  hint: string;
  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
    this.hint = hintFor(status, body);
  }
}

function hintFor(status: number, body: unknown): string {
  switch (status) {
    case 401:
    case 403:
      return config.hasKey
        ? 'The API key was rejected. Check TYPESAFE_API_KEY in .env and restart the dev server.'
        : 'No API key is configured. Add TYPESAFE_API_KEY to .env and restart the dev server.';
    case 422:
      return 'The request failed validation. The details below name the offending field.';
    case 429:
      return 'Rate limited. Retried with backoff and still limited. Wait a moment and try again.';
    case 529:
      return 'The model is temporarily overloaded. Try again shortly.';
    case 502:
    case 504:
      return `Could not reach ${config.baseUrl}. Check TYPESAFE_BASE_URL and your network.`;
    default:
      return typeof body === 'string' && body ? body : 'Unexpected error from the API.';
  }
}

const RETRYABLE = new Set([429, 529]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export interface EvaluateResult {
  response: EvaluateResponse;
  latencyMs: number;
  attempts: number;
}

/** POST /v1/systemone with exponential backoff on 429/529, honoring retry-after. */
export async function evaluate(
  req: EvaluateRequest,
  opts: { signal?: AbortSignal; maxAttempts?: number } = {},
): Promise<EvaluateResult> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const started = performance.now();
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API_ROOT}/systemone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: opts.signal,
    });
    if (res.ok) {
      const response = (await res.json()) as EvaluateResponse;
      return { response, latencyMs: Math.round(performance.now() - started), attempts: attempt };
    }
    if (RETRYABLE.has(res.status) && attempt < maxAttempts) {
      const retryAfter = Number(res.headers.get('retry-after'));
      const delay = retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** (attempt - 1);
      await sleep(delay);
      continue;
    }
    throw new ApiError(res.status, await parseBody(res));
  }
}

/** GET /v1/models. Falls back to the documented aliases if unavailable. */
export async function listModels(): Promise<ModelInfo[]> {
  const fallback = [...new Set([config.defaultModel, 'jev-latest', 'jev-preview'])].map((id) => ({
    id,
  }));
  try {
    const res = await fetch(`${API_ROOT}/models`);
    if (!res.ok) return fallback;
    const body = (await res.json()) as unknown;
    const list = Array.isArray(body)
      ? body
      : ((body as { data?: unknown[]; models?: unknown[] }).data ??
        (body as { models?: unknown[] }).models ??
        []);
    const models = list
      .map((m): ModelInfo | null => {
        if (typeof m === 'string') return { id: m };
        if (m && typeof m === 'object') {
          const o = m as Record<string, unknown>;
          const id = (o.id ?? o.name ?? o.model) as string | undefined;
          if (!id) return null;
          return {
            id,
            description: o.description as string | undefined,
            released: (o.release_date ?? o.released ?? o.created) as string | undefined,
          };
        }
        return null;
      })
      .filter((m): m is ModelInfo => m !== null);
    return models.length ? models : fallback;
  } catch {
    return fallback;
  }
}
