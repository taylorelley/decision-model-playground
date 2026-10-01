import { useId, useState } from 'react';
import { glossary } from '../content/glossary';

/** A glossary term with a hover/focus definition. */
export function Term({ id, children }: { id: string; children?: React.ReactNode }) {
  const entry = glossary[id];
  const [open, setOpen] = useState(false);
  const tipId = useId();
  if (!entry) return <>{children ?? id}</>;
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="cursor-help border-b border-dotted border-accent font-medium text-ink"
      >
        {children ?? entry.term.toLowerCase()}
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-md border border-line bg-surface p-3 text-left text-xs leading-relaxed font-normal text-muted shadow-lg"
        >
          <span className="mb-1 block font-semibold text-ink">{entry.term}</span>
          {entry.definition}
        </span>
      )}
    </span>
  );
}
