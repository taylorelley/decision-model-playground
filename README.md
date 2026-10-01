# Decision Model Playground

A lightweight local app for **learning** how System One decision models work, such as TypeSafe's
[Jev](https://docs.typesafe.ai/introduction) and other models that serve the same `POST /v1/systemone`
API.

Decision models don't generate text. They read a **state**, answer typed **questions** (Noul, Choice,
Score) and return calibrated probabilities that your code acts on. This app teaches you to ask good
questions and to read the answers.

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
  - **Developer**: JSON editors like the TypeSafe console, the raw response, and copy-ready curl,
    JavaScript and Python SDK snippets.
- **Concepts**: an interactive confidence explorer, patterns, tips for writing good questions, and a
  glossary. Glossary terms are also available as tooltips throughout the app.
- Share links that store the request in the URL (no server), and drafts that persist in
  `localStorage`.

## Setup

Requires Node 20+.

```bash
npm install
cp .env.example .env      # then set TYPESAFE_API_KEY
npm run dev               # http://localhost:5173
```

| Variable            | Default                   | Purpose                                                   |
| ------------------- | ------------------------- | --------------------------------------------------------- |
| `TYPESAFE_API_KEY`  | —                         | Your API key (console.typesafe.ai → API Keys)             |
| `TYPESAFE_BASE_URL` | `https://api.typesafe.ai` | Any server implementing `POST /v1/systemone`              |
| `DEFAULT_MODEL`     | `jev-latest`              | Model preselected in the playground (free text in the UI) |

### Docker

```bash
docker build -t decision-model-playground .
docker run --rm -p 4173:4173 -e TYPESAFE_API_KEY=your-key decision-model-playground
# open http://localhost:4173
```

The container serves the production build with `vite preview`, using the same `/api` proxy.
`TYPESAFE_BASE_URL` and `DEFAULT_MODEL` can also be passed with `-e`. Settings are read when the
container starts, so you can reuse one image with different keys and endpoints. `.env` is excluded
from the build context, so a key never ends up in the image.

To use the mock server from a container, run it on the host and point the container at it. For
example, on Linux:
`docker run --rm --network host -e TYPESAFE_API_KEY=mock -e TYPESAFE_BASE_URL=http://localhost:8787 decision-model-playground`.

### Why requests go through `/api`

The TypeSafe API doesn't accept browser (CORS) requests from `localhost`. Instead, the browser calls
`/api/*` on the Vite dev/preview server, which forwards the request to `TYPESAFE_BASE_URL` and adds
`Authorization: Bearer $TYPESAFE_API_KEY`. That proxy is the only server-side piece, and it is
configured in `vite.config.ts`. That file also serves the non-secret settings (whether a key is set, the endpoint, the default model) at `/__playground/config`. The key stays in the Vite process and is never bundled into
browser code. `npm run build && npm run preview` uses the same proxy.

### Using a compatible model

Set `TYPESAFE_BASE_URL` to any server that implements the same request and response shapes
([API reference](https://docs.typesafe.ai/api.md)), then type its model name in the **Model** box. If
the server also serves `GET /v1/models`, its models appear as suggestions. Answer types the UI
doesn't recognize are shown as raw JSON.

### Offline / UI development: mock server

```bash
npm run mock    # mock API on http://localhost:8787
TYPESAFE_BASE_URL=http://localhost:8787 TYPESAFE_API_KEY=mock npm run dev
```

The mock returns deterministic **random** answers in the correct shape, so you can work on the UI
without a key. The app labels mock responses clearly. Don't learn from these numbers.

## Scripts

| Script              | Does                            |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server with API proxy       |
| `npm run build`     | Type-check and build to `dist/` |
| `npm run preview`   | Serve the build (also proxied)  |
| `npm test`          | Unit tests (Vitest)             |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript                      |
| `npm run mock`      | Local mock of `/v1/systemone`   |

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
