"use client";

import hljs from "highlight.js";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Icons } from "~/components";
import { Button } from "~/components/ui";

type PasteClientProps = {
  initialText: string;
};

export function PasteClient({ initialText }: PasteClientProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleNew = () => {
    router.push("/paste");
  };

  const { language } = hljs.highlightAuto(initialText);
  return (
    <div className="relative">
      <div className="fixed right-4 top-16 z-10">
        <Button variant="secondary" size="sm" onClick={handleNew}>
          <Icons.new className="h-5 w-5" />
        </Button>
      </div>
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
