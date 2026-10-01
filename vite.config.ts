/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Connect, type Plugin, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { normalizeBaseUrl } from './src/lib/baseUrl';

// Decision model APIs generally don't accept browser (CORS) requests from localhost, so
// the browser talks to `/api/*` on the Vite server, which forwards the call upstream and
// attaches the API key. The key stays in this Node process and is never sent to the
// browser bundle.
//
//   /api/evaluate -> DECISION_BASE_URL + DECISION_ENDPOINT_PATH
//   /api/models   -> DECISION_BASE_URL + DECISION_MODELS_PATH
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.DECISION_API_KEY ?? '';
  const endpointPath = withSlash(env.DECISION_ENDPOINT_PATH || '/v1/systemone');
  const modelsPath = withSlash(env.DECISION_MODELS_PATH || '/v1/models');
  const rawBaseUrl = (env.DECISION_BASE_URL ?? '').trim();
  const baseUrl = normalizeBaseUrl(rawBaseUrl, [endpointPath, modelsPath]);
  const defaultModel = (env.DECISION_MODEL ?? '').trim();
  // TLS certificate verification for the upstream API is OFF by default, so the app keeps
  // working behind TLS-intercepting proxies or with self-signed certificates. Only the /api
  // proxy's outbound call is affected. Set DECISION_VERIFY_TLS=true to turn checks back on.
  const verifyTls = /^(1|true|yes|on)$/i.test(env.DECISION_VERIFY_TLS ?? '');
  const serving = command === 'serve' && !process.env.VITEST;

  if (serving && !baseUrl) {
    console.warn('[playground] DECISION_BASE_URL is not set; requests to the model will fail.');
  }
  if (serving && baseUrl) {
    if (baseUrl !== rawBaseUrl.replace(/\/+$/, '')) {
      console.warn(
        `[playground] DECISION_BASE_URL should be the server root; using ${baseUrl} ` +
          `instead of ${rawBaseUrl} so the endpoint path is not repeated.`,
      );
    }
    console.info(`[playground] Evaluation requests go to POST ${baseUrl}${endpointPath}`);
  }
  if (serving && !verifyTls && baseUrl.startsWith('https:')) {
    console.warn(
      `[playground] TLS certificate verification is disabled for ${baseUrl}. ` +
        'Set DECISION_VERIFY_TLS=true to enable it.',
    );
  }

  const apiProxy: Record<string, ProxyOptions> = baseUrl
    ? {
        '/api': {
          target: baseUrl,
          changeOrigin: true,
          secure: verifyTls,
          rewrite: (path) =>
            path
              .replace(/^\/api\/evaluate(?=$|\?)/, endpointPath)
              .replace(/^\/api\/models(?=$|\?)/, modelsPath)
              .replace(/^\/api(?=\/)/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Server-to-server call: drop browser-only headers the upstream would treat as CORS.
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('cookie');
              if (apiKey) proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
            });
            // Tell the browser which upstream URL answered, so errors like 404 can name it.
            proxy.on('proxyRes', (proxyRes) => {
              const path = (proxyRes as { req?: { path?: string } }).req?.path ?? '';
              proxyRes.headers['x-playground-upstream'] = `${new URL(baseUrl).origin}${path}`;
            });
          },
        },
      }
    : {};

  // Non-secret settings, served at runtime so a prebuilt bundle (e.g. the Docker
  // image) reflects the environment it runs in rather than the one it was built in.
  const runtimeConfig = JSON.stringify({
    hasKey: apiKey.length > 0,
    baseUrl,
    endpointPath,
    defaultModel,
  });
  const serveConfig: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url === '/__playground/config') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(runtimeConfig);
      return;
    }
    if (!baseUrl && req.url?.startsWith('/api/')) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ detail: 'DECISION_BASE_URL is not set on the playground server.' }));
      return;
    }
    next();
  };
  const runtimeConfigPlugin: Plugin = {
    name: 'playground-runtime-config',
    configureServer: (server) => void server.middlewares.use(serveConfig),
    configurePreviewServer: (server) => void server.middlewares.use(serveConfig),
  };

  return {
    plugins: [react(), tailwindcss(), runtimeConfigPlugin],
    // Build-time fallbacks, used by tests and if the runtime config can't be fetched.
    define: {
      __HAS_KEY__: JSON.stringify(apiKey.length > 0),
      __BASE_URL__: JSON.stringify(baseUrl),
      __ENDPOINT_PATH__: JSON.stringify(endpointPath),
      __DEFAULT_MODEL__: JSON.stringify(defaultModel),
    },
    server: { proxy: apiProxy },
    build: { chunkSizeWarningLimit: 1200 },
    preview: { proxy: apiProxy },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});

function withSlash(p: string): string {
  const t = p.trim();
  return t.startsWith('/') ? t : `/${t}`;
}
