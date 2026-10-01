import { useEffect, useRef, useState, type TextareaHTMLAttributes } from 'react';
import { asText, parseLoose } from '../../lib/format';
import { cx } from '../ui';

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none';

/** Auto-growing textarea. */
export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [props.value]);
  return (
    <textarea ref={ref} rows={1} {...props} className={cx(fieldClass, 'resize-none', className)} />
  );
}

/**
 * Edits a value that may be plain text or JSON (instructions, criteria descriptions).
 * Keeps the user's raw text while typing so half-written JSON is not reformatted.
 */
export function StructuredField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
  nullable,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  nullable?: boolean;
}) {
  const [text, setText] = useState(() => asText(value));
  const lastEmitted = useRef<unknown>(value);
  useEffect(() => {
    // Sync only when the value changed from outside (e.g. dev mode or loading an example).
    if (JSON.stringify(value) !== JSON.stringify(lastEmitted.current)) {
      setText(asText(value));
      lastEmitted.current = value;
    }
  }, [value]);
  const isJson = typeof value === 'object' && value !== null;
  return (
    <div className="relative">
      <TextArea
        aria-label={ariaLabel}
        value={text}
        placeholder={placeholder}
        className={cx(isJson && 'font-mono text-xs', className)}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          const v = nullable && t.trim() === '' ? null : parseLoose(t);
          lastEmitted.current = v;
          onChange(v);
        }}
      />
      {isJson && (
        <span className="pointer-events-none absolute top-1 right-1.5 rounded bg-sunken px-1 text-[10px] text-faint">
          JSON
        </span>
      )}
    </div>
  );
}

/** A text input that commits on blur/Enter, for renaming keys. */
export function CommitInput({
  value,
  onCommit,
  ariaLabel,
  className,
  placeholder,
}: {
  value: string;
  onCommit: (v: string) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(value);
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    // The key was renamed elsewhere; adopt the new value.
    setPrev(value);
    setText(value);
  }
  const commit = () => {
    const t = text.trim();
    if (t && t !== value) onCommit(t);
    else setText(value);
  };
  return (
    <input
      aria-label={ariaLabel}
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') setText(value);
      }}
      className={cx(fieldClass, 'font-mono', className)}
    />
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] leading-snug text-faint">{children}</p>;
}
