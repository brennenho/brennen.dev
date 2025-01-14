type TextEditorProps = {
  value: string;
  onChange?: (text: string) => void;
  disabled?: boolean;
};

export function TextEditor({ value, onChange, disabled }: TextEditorProps) {
  const handleChange = (text: string) => {
    if (onChange) {
      onChange(text);
    }
  };

  return (
    <div className="flex h-full w-full flex-row gap-4">
      <div id="linenums">{">"}</div>
      <textarea
        spellCheck="false"
        placeholder="paste anything..."
        className="h-full w-full resize-none bg-transparent font-mono outline-none"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
      ></textarea>
    </div>
  );
}
