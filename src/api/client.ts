import type { EvaluateRequest, EvaluateResponse, ModelInfo } from './types';

/**
 * Requests go to the playground server's proxy, which maps them to DECISION_BASE_URL
 * (+ DECISION_ENDPOINT_PATH / DECISION_MODELS_PATH) and attaches the API key.
 */
const EVALUATE_URL = '/api/evaluate';
const MODELS_URL = '/api/models';

export interface RuntimeConfig {
  hasKey: boolean;
  baseUrl: string;
  endpointPath: string;
  defaultModel: string;
}

/** Non-secret settings. Starts from build-time values; `loadRuntimeConfig` refreshes them. */
export const config: RuntimeConfig = {
  hasKey: __HAS_KEY__,
  baseUrl: __BASE_URL__,
  endpointPath: __ENDPOINT_PATH__,
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
    if (typeof c.endpointPath === 'string') config.endpointPath = c.endpointPath;
    if (typeof c.defaultModel === 'string') config.defaultModel = c.defaultModel;
  } catch {
    /* keep build-time values */
  }
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  hint: string;
  /** The upstream URL the playground server forwarded to, when known. */
  upstream?: string;
  constructor(status: number, body: unknown, upstream?: string) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
    this.upstream = upstream;
    this.hint = hintFor(status, body, upstream);
  }
}

function hintFor(status: number, body: unknown, upstream?: string): string {
  switch (status) {
    case 404:
    case 405:
      return (
        `The model server has no endpoint at ${upstream ?? 'the requested path'}. ` +
        `DECISION_BASE_URL should be the server root (e.g. http://host:8080) and ` +
        `DECISION_ENDPOINT_PATH the evaluation path (currently ${config.endpointPath}).`
      );
    case 401:
    case 403:
      return config.hasKey
        ? 'The API key was rejected. Check DECISION_API_KEY and restart the playground server.'
        : 'No API key is configured. Set DECISION_API_KEY and restart the playground server.';
    case 422:
      return 'The request failed validation. The details below name the offending field.';
    case 429:
      return 'Rate limited. Retried with backoff and still limited. Wait a moment and try again.';
    case 529:
      return 'The model is temporarily overloaded. Try again shortly.';
    case 502:
    case 504:
      return `Could not reach ${config.baseUrl || 'the model endpoint'}. Check DECISION_BASE_URL and your network.`;
    case 503:
      return config.baseUrl
        ? 'The model service is unavailable. Try again shortly.'
        : 'No model endpoint is configured. Set DECISION_BASE_URL and restart the playground server.';
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

/** Evaluate a request, with exponential backoff on 429/529 and honoring retry-after. */
export async function evaluate(
  req: EvaluateRequest,
  opts: { signal?: AbortSignal; maxAttempts?: number } = {},
): Promise<EvaluateResult> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const started = performance.now();
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(EVALUATE_URL, {
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
    throw new ApiError(
      res.status,
      await parseBody(res),
      res.headers.get('x-playground-upstream') ?? undefined,
    );
  }
}

/** List the endpoint's models. Falls back to the configured default model if unavailable. */
export async function listModels(): Promise<ModelInfo[]> {
  const fallback: ModelInfo[] = config.defaultModel ? [{ id: config.defaultModel }] : [];
  try {
    const res = await fetch(MODELS_URL);
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
