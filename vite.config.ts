/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The TypeSafe API does not allow browser (CORS) requests from localhost, so the
// browser talks to `/api/*` on the Vite server, which forwards the call upstream
// and attaches the API key. The key stays in this Node process and is never sent
// to the browser bundle.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.TYPESAFE_API_KEY ?? '';
  const baseUrl = (env.TYPESAFE_BASE_URL || 'https://api.typesafe.ai').replace(/\/+$/, '');
  const defaultModel = env.DEFAULT_MODEL || 'jev-latest';

  const apiProxy: Record<string, ProxyOptions> = {
    '/api': {
      target: baseUrl,
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          // Server-to-server call: drop browser-only headers the upstream would treat as CORS.
          proxyReq.removeHeader('origin');
          proxyReq.removeHeader('referer');
          proxyReq.removeHeader('cookie');
          if (apiKey) proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
        });
      },
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __HAS_KEY__: JSON.stringify(apiKey.length > 0),
      __BASE_URL__: JSON.stringify(baseUrl),
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
