"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

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
          disabled={disabled}
        ></textarea>
      </div>
    );
  },
);
