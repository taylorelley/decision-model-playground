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
