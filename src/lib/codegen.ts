import type { EvaluateRequest } from '../api/types';

export type CodeLang = 'curl' | 'javascript' | 'python';

/** Render the request as code. `endpoint` is the full upstream URL (base URL + endpoint path). */
export function toCode(req: EvaluateRequest, lang: CodeLang, endpoint: string): string {
  const json = JSON.stringify(req, null, 2);
  const url = endpoint || 'https://your-decision-model-host/v1/...';
  switch (lang) {
    case 'curl':
      return `curl ${url} \\
  -H "Authorization: Bearer $DECISION_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d @- <<'JSON'
${json}
JSON`;
    case 'javascript':
      return `const res = await fetch(${JSON.stringify(url)}, {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.DECISION_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${indent(json, 2)}),
});
const { answers } = await res.json();
`;
    case 'python':
      return `# pip install requests
import os
import requests

response = requests.post(
    ${JSON.stringify(url)},
    headers={"Authorization": f"Bearer {os.environ['DECISION_API_KEY']}"},
    json={
        "model": ${pyLiteral(req.model)},
        "state": ${pyLiteral(req.state, 2)},
        "questions": ${pyLiteral(req.questions, 2)},
    },
    timeout=30,
)
response.raise_for_status()

for key, answer in response.json()["answers"].items():
    print(key, answer)
`;
  }
}

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s
    .split('\n')
    .map((l, i) => (i === 0 ? l : pad + l))
    .join('\n');
}

/** JSON → Python literal (dicts/lists/str/None/True/False). */
export function pyLiteral(v: unknown, level = 0): string {
  const pad = '    '.repeat(level + 1);
  const end = '    '.repeat(level);
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    return `[\n${v.map((x) => pad + pyLiteral(x, level + 1)).join(',\n')},\n${end}]`;
  }
  const entries = Object.entries(v as Record<string, unknown>);
  if (!entries.length) return '{}';
  return `{\n${entries.map(([k, x]) => `${pad}${JSON.stringify(k)}: ${pyLiteral(x, level + 1)}`).join(',\n')},\n${end}}`;
}
