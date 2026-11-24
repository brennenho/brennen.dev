"use client";

import { cn } from "@/lib/utils";
import { Check, Share2 } from "lucide-react";
import { useEffect, useId, useState } from "react";

export function ShareButton({ disabled }: { disabled: boolean }) {
  const [copied, setCopied] = useState(false);
  const shareNoteId = useId();
  const ShareIcon = copied ? Check : Share2;

  useEffect(() => {
    if (!copied) return;

    const id = window.setTimeout(() => setCopied(false), 1400);

    return () => window.clearTimeout(id);
  }, [copied]);

  async function copyPageLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={
          disabled
            ? "Share unavailable for local pages"
            : copied
              ? "Copied page link"
              : "Copy page link"
        }
        aria-disabled={disabled || undefined}
        aria-describedby={disabled ? shareNoteId : undefined}
        onClick={disabled ? undefined : copyPageLink}
        className={cn(
          "focus-visible:outline-ring min-[900px]:text-foreground inline-flex size-10 shrink-0 items-center justify-center rounded font-medium transition-colors focus-visible:outline-2 min-[900px]:h-8 min-[900px]:w-16",
          disabled
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-accent hover:text-foreground cursor-pointer",
        )}
      >
        <ShareIcon className="size-[18px] min-[900px]:hidden" />
        <span className="hidden min-[900px]:inline">
          {copied ? "Copied" : "Share"}
        </span>
      </button>
      {disabled && (
        <span
          id={shareNoteId}
          role="tooltip"
          className="bg-popover text-popover-foreground border-border absolute top-full right-0 z-50 hidden w-max max-w-56 rounded-md border px-3 py-2 text-xs font-medium shadow-md group-focus-within:block group-hover:block"
        >
          Local musings can&apos;t be shared.
        </span>
      )}
    </span>
  );
}
