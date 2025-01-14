type TextEditorProps = {
  value: string;
  onChange: (text: string) => void;
};

export function TextEditor({ value, onChange }: TextEditorProps) {
  return (
    <div className="flex h-full w-full flex-row gap-4">
      <div id="linenums">{">"}</div>
      <textarea
        spellCheck="false"
        placeholder="paste anything..."
        className="h-full w-full resize-none bg-transparent font-mono outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>
    </div>
  );
}
