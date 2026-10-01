import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useMemo } from 'react';
import { useColorScheme } from '../lib/useColorScheme';

export function JsonEditor({
  value,
  onChange,
  readOnly,
  ariaLabel,
  placeholder,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  ariaLabel: string;
  placeholder?: string;
}) {
  const scheme = useColorScheme();
  const extensions = useMemo(
    () => [
      json(),
      EditorView.theme({
        '&': { backgroundColor: 'var(--surface)', color: 'var(--ink)' },
        '.cm-gutters': {
          backgroundColor: 'var(--page)',
          color: 'var(--faint)',
          borderRight: '1px solid var(--line)',
        },
        '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--sunken)' },
        '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--accent)' },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
          backgroundColor: 'var(--accent-soft)',
        },
        '.cm-placeholder': { color: 'var(--faint)' },
        '.cm-panels, .cm-tooltip': {
          backgroundColor: 'var(--sunken)',
          color: 'var(--ink)',
          borderColor: 'var(--line)',
        },
        '.cm-searchMatch': { backgroundColor: 'var(--accent-soft)' },
        '.cm-searchMatch.cm-searchMatch-selected': { outline: '1px solid var(--accent)' },
      }),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
    ],
    [ariaLabel],
  );
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      theme={scheme}
      height="100%"
      className="h-full"
      placeholder={placeholder}
      extensions={extensions}
      basicSetup={{ foldGutter: true, highlightActiveLine: !readOnly, autocompletion: false }}
    />
  );
}
