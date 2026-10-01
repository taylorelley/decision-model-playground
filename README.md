# Decision Model Playground

A lightweight local app for **learning** how decision models work, with any provider whose API
follows the same request and response format.

Decision models don't generate text. They read a **state**, answer typed **questions** (Noul, Choice,
Score) and return probabilities that your code acts on. This app teaches you to ask good questions
and to read the answers.

## What's inside

- **Lessons**: seven step-by-step walkthroughs. Three cover the primitives: _Is a hotdog a sandwich?_,
  _What color is the sky?_ and _Can monkeys create art?_. Four cover concepts: structured state,
  structured instructions, fan-out, and acting on confidence. Each step loads a working request,
  explains what to notice, and suggests edits to try.
- **Use-case gallery**: real-life examples ready to run, including resumé screening, support audit,
  LLM guardrails, intent routing, moderation, RAG relevance, citation check, lead scoring,
  confidence-gated actions, agent tool selection and **ATC conflict triage**. Each one explains why it
  uses the primitives it does and how code would act on the answers.
- **Two playground modes that edit the same request**:
  - **Simple**: forms with hints, and plain-language answers with "How to read this" explainers.
    The explainers cover P(yes), score as an expected level, and confidence worked out from the
    actual probabilities.
  - **Developer**: raw JSON editors, the raw response, and copy-ready curl, JavaScript and Python
    snippets.
- **Concepts**: an interactive confidence explorer, patterns, tips for writing good questions, and a
  glossary. Glossary terms are also available as tooltips throughout the app.
- Share links that store the request in the URL (no server), and drafts that persist in
  `localStorage`.

## Setup

Requires Node 20+.

```bash
npm install
cp .env.example .env      # then set DECISION_BASE_URL and DECISION_API_KEY
npm run dev               # http://localhost:5173
```

| Variable                 | Default         | Purpose                                                                       |
| ------------------------ | --------------- | ----------------------------------------------------------------------------- |
| `DECISION_BASE_URL`      | — (required)    | Base URL of the decision model API, e.g. `https://api.example.com`            |
| `DECISION_API_KEY`       | —               | API key, sent upstream as `Authorization: Bearer <key>`                       |
| `DECISION_MODEL`         | —               | Model preselected in the playground (you can type any name in the UI)         |
| `DECISION_ENDPOINT_PATH` | `/v1/systemone` | Path of the evaluation endpoint on `DECISION_BASE_URL`                        |
| `DECISION_MODELS_PATH`   | `/v1/models`    | Path of the optional model-listing endpoint                                   |
| `DECISION_VERIFY_TLS`    | `false`         | Set to `true` to verify the API's TLS certificate (off by default; see below) |

The app shows a banner until `DECISION_BASE_URL` and `DECISION_API_KEY` are set.

### Docker

```bash
docker build -t decision-model-playground .
docker run --rm -p 4173:4173 \
  -e DECISION_BASE_URL=https://api.example.com \
  -e DECISION_API_KEY=your-key \
  -e DECISION_MODEL=your-model \
  decision-model-playground
# open http://localhost:4173
```

The container serves the production build with `vite preview`, using the same `/api` proxy. Settings
are read when the container starts, so you can reuse one image with different providers, keys and
models. `.env` is excluded from the build context, so a key never ends up in the image.

To use the mock server from a container, run it on the host and point the container at it. For
example, on Linux:
`docker run --rm --network host -e DECISION_API_KEY=mock -e DECISION_BASE_URL=http://localhost:8787 decision-model-playground`.

### Why requests go through `/api`

Decision model APIs generally don't accept browser (CORS) requests from `localhost`. Instead, the
browser calls the Vite dev/preview server:

- `/api/evaluate` is forwarded to `DECISION_BASE_URL` + `DECISION_ENDPOINT_PATH`.
- `/api/models` is forwarded to `DECISION_BASE_URL` + `DECISION_MODELS_PATH`.

The server adds `Authorization: Bearer $DECISION_API_KEY` to both. That proxy is the only
server-side piece, and it is configured in `vite.config.ts`. That file also serves the non-secret
settings (whether a key is set, the endpoint, the default model) at `/__playground/config`. The key
stays in the server process and is never bundled into browser code.

### TLS certificate verification

By default, the `/api` proxy **does not verify** the upstream server's TLS certificate, both in local
dev and in Docker. This lets the app work behind corporate TLS-inspecting proxies and with
self-signed certificates. It applies only to the proxy's call to `DECISION_BASE_URL`, not to the
rest of Node, and the server logs a warning at startup.

The trade-off: anyone who can intercept that connection could read your API key. On a trusted
network, set `DECISION_VERIFY_TLS=true` (in `.env`, or with `-e` for Docker) to turn verification
back on.

### API format

The playground sends `POST` requests with `{ "state", "model", "questions" }`. Each question has a
`type` of `noul`, `choice` or `score`, plus `instructions` and `criteria`. It expects
`{ "model", "answers", "usage" }` back, with one answer per question id. `src/api/types.ts` has the
exact shapes. Answer types the UI doesn't recognize are shown as raw JSON. If the server also lists
models at `DECISION_MODELS_PATH`, they appear as suggestions in the **Model** box.

### Offline / UI development: mock server

```bash
npm run mock    # mock API on http://localhost:8787
DECISION_BASE_URL=http://localhost:8787 DECISION_API_KEY=mock npm run dev
```

The mock returns deterministic **random** answers in the correct shape, so you can work on the UI
without a real provider. The app labels mock responses clearly. Don't learn from these numbers.

## Scripts

| Script              | Does                            |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server with API proxy       |
| `npm run build`     | Type-check and build to `dist/` |
| `npm run preview`   | Serve the build (also proxied)  |
| `npm test`          | Unit tests (Vitest)             |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript                      |
| `npm run mock`      | Local mock decision model API   |

## Project layout

```
src/
  api/         types, client (retries 429/529 with backoff), request validation
  content/     lessons, gallery examples, glossary (plain data; easy to extend)
  components/  answer visualizations, simple-mode forms, dev-mode editors, response panel
  pages/       Home, Lessons, Lesson, Gallery, Playground, Concepts
  store/       shared draft state for both modes
scripts/       mock-server.mjs
```

To add a lesson or an example, append an entry to `src/content/lessons.ts` or
`src/content/examples.ts`. A unit test checks that every lesson and example is a valid request.
