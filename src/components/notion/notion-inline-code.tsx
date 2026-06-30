import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function NotionInlineCode({
  children,
  className,
  style,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className={cn(
        "notion-inline-code rounded px-1.5 py-0.5 font-mono text-[0.9em]",
        className,
      )}
      style={{
        backgroundColor: "var(--notion-inline-code-bg, #2f2f2e)",
        color: "var(--notion-inline-code-color, #eb5757)",
        ...style,
      }}
      {...props}
    >
      {children}
    </code>
  );
}
