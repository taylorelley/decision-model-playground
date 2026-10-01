import type { ReactNode } from 'react';
import { Term } from './Term';

// Tiny inline markup: `code`, **bold**, [[glossary-id]] or [[glossary-id|label]], [label](url).
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\[\[[^\]]+\]\]|\[[^\]]+\]\([^)]+\))/g;

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((p, i): ReactNode => {
        if (p.startsWith('`') && p.endsWith('`'))
          return (
            <code
              key={i}
              className="rounded bg-sunken px-1 py-0.5 font-mono text-[0.85em] text-ink"
            >
              {p.slice(1, -1)}
            </code>
          );
        if (p.startsWith('**') && p.endsWith('**'))
          return (
            <strong key={i} className="font-semibold text-ink">
              {p.slice(2, -2)}
            </strong>
          );
        if (p.startsWith('[[') && p.endsWith(']]')) {
          const [id, label] = p.slice(2, -2).split('|');
          return (
            <Term key={i} id={id}>
              {label}
            </Term>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
        if (link)
          return (
            <a
              key={i}
              href={link[2]}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              {link[1]}
            </a>
          );
        return p;
      })}
    </>
  );
}
