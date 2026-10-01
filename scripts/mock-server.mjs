// A tiny stand-in for POST /v1/systemone, for UI development and offline demos.
// Answers are deterministic pseudo-random numbers, NOT real model output.
//
//   npm run mock                      # listens on http://localhost:8787
//   TYPESAFE_BASE_URL=http://localhost:8787 TYPESAFE_API_KEY=mock npm run dev
import http from 'node:http';

const PORT = Number(process.env.MOCK_PORT ?? 8787);

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic, peaked probability distribution over n outcomes. */
function distribution(seed, n) {
  let s = seed || 1;
  const rand = () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0) % 10000) / 10000;
  const peak = Math.floor(rand() * n);
  const sharpness = 0.5 + rand() * 4;
  const raw = Array.from(
    { length: n },
    (_, i) => Math.exp(-sharpness * Math.abs(i - peak)) * (0.6 + rand() * 0.4),
  );
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((r) => Math.round((r / total) * 1000) / 1000);
}

const confidence = (ps) => {
  const n = ps.length;
  return n < 2 ? 1 : Math.max(0, Math.min(1, (n * Math.max(...ps) - 1) / (n - 1)));
};
const round = (x) => Math.round(x * 1000) / 1000;

function answer(q, seed) {
  if (q.type === 'noul') {
    const [p] = distribution(seed, 2);
    return { type: 'noul', noul: round(p) };
  }
  if (q.type === 'choice') {
    const opts = Object.keys(q.criteria ?? {});
    const ps = distribution(seed, opts.length);
    const probabilities = Object.fromEntries(opts.map((o, i) => [o, ps[i]]));
    const choice = opts[ps.indexOf(Math.max(...ps))];
    return { type: 'choice', choice, probabilities, confidence: round(confidence(ps)) };
  }
  if (q.type === 'score') {
    const levels = q.criteria ?? [];
    const ps = distribution(seed, levels.length);
    const legend = Object.fromEntries(
      levels.map((l, i) => [String(i), typeof l === 'string' ? l : JSON.stringify(l)]),
    );
    const probabilities = Object.fromEntries(ps.map((p, i) => [String(i), p]));
    const score = ps.reduce((a, p, i) => a + p * i, 0);
    return {
      type: 'score',
      score: round(score),
      legend,
      probabilities,
      confidence: round(confidence(ps)),
    };
  }
  return null;
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

http
  .createServer((req, res) => {
    const auth = req.headers.authorization ?? '';
    console.log(`${req.method} ${req.url} auth=${auth ? 'Bearer ***' : 'none'}`);
    if (!auth.startsWith('Bearer ') || auth.length <= 7)
      return send(res, 401, { detail: 'Missing or invalid API key' });

    if (req.method === 'GET' && req.url === '/v1/models') {
      return send(res, 200, {
        data: [
          { id: 'jev-latest', description: 'Mock of the latest stable Jev' },
          { id: 'jev-preview', description: 'Mock of the preview alias' },
        ],
      });
    }
    if (req.method !== 'POST' || req.url !== '/v1/systemone')
      return send(res, 404, { detail: 'Not found' });

    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        return send(res, 422, { detail: [{ loc: ['body'], msg: 'Invalid JSON' }] });
      }
      if (body.state == null || !body.model || !body.questions)
        return send(res, 422, {
          detail: [{ loc: ['body'], msg: 'state, model and questions are required' }],
        });
      const stateStr = JSON.stringify(body.state);
      const answers = {};
      for (const [id, q] of Object.entries(body.questions)) {
        const a = answer(q, hash(stateStr + JSON.stringify(q)));
        if (!a)
          return send(res, 422, {
            detail: [{ loc: ['body', 'questions', id, 'type'], msg: 'Unknown type' }],
          });
        answers[id] = a;
      }
      const inputTokens = Math.ceil((stateStr.length + JSON.stringify(body.questions).length) / 4);
      setTimeout(
        () =>
          send(res, 200, {
            model: 'jev-mock-0.0.0',
            answers,
            usage: { input_tokens: inputTokens, output_tokens: 6 * Object.keys(answers).length },
          }),
        150,
      );
    });
  })
  .listen(PORT, () => console.log(`Mock System One API on http://localhost:${PORT}`));
