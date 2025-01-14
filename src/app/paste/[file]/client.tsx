"use client";

import hljs from "highlight.js";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";

type PasteClientProps = {
  initialText: string;
};

export function PasteClient({ initialText }: PasteClientProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const { language } = hljs.highlightAuto(initialText);
  return (
    <div className="relative">
      <SyntaxHighlighter
        key={theme}
        language={language}
        style={theme === "dark" ? solarizedDark : solarizedLight}
        showLineNumbers
        customStyle={{
          backgroundColor: "transparent",
        }}
      >
        {initialText}
      </SyntaxHighlighter>
    </div>
  );
}
