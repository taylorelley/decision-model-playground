export const pct = (p: number, digits = 0) => `${(p * 100).toFixed(digits)}%`;
export const num = (n: number, digits = 2) => n.toFixed(digits);

/** Render structured instructions/criteria as readable text. */
export function asText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

/** Parse text that might be JSON; fall back to the raw string. */
export function parseLoose(text: string): unknown {
  const t = text.trim();
  if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
    try {
      return JSON.parse(t);
    } catch {
      return text;
    }
  }
  return text;
}
