"use client";
import {
  forwardRef,
  KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

type TextEditorProps = {
  value: string;
  onChange?: (text: string) => void;
  disabled?: boolean;
};

export type TextEditorRef = {
  focus: () => void;
};

export const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  function TextEditor({ value, onChange, disabled }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);

    const handleChange = (text: string) => {
      if (onChange) {
        onChange(text);
      }
      adjustHeight();
    };

    // enable tab in editor
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();

        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;

        const updatedValue =
          value.substring(0, start) + "\t" + value.substring(end);

        onChange?.(updatedValue);

        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 1;
            textareaRef.current.selectionEnd = start + 1;
          }
        });
      }
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    return (
      <div className="flex w-full flex-row gap-4">
        <div id="linenums">{">"}</div>
        <textarea
          ref={textareaRef}
          spellCheck="false"
          placeholder="paste anything..."
          className="w-full resize-none overflow-hidden bg-transparent font-mono outline-none"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        ></textarea>
      </div>
    );
  },
);
