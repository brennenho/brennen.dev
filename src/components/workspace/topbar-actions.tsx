"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

type TopbarActionsProps = {
  isFavorite: boolean;
  shareUrl?: string;
};

const actionClassName =
  "cursor-pointer rounded px-2 py-1 transition-colors hover:bg-accent hover:text-foreground";

export function TopbarActions({ isFavorite, shareUrl }: TopbarActionsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const id = window.setTimeout(() => setCopied(false), 1400);

    return () => window.clearTimeout(id);
  }, [copied]);

  async function copyPageLink() {
    try {
      await navigator.clipboard.writeText(shareUrl ?? window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copyPageLink}
        className={cn(
          "text-foreground inline-flex w-16 justify-center font-medium",
          actionClassName,
        )}
      >
        {copied ? "Copied" : "Share"}
      </button>
      <span
        aria-label={isFavorite ? "Favorited" : "Not favorited"}
        className={cn(
          "text-muted-foreground px-2 py-1",
          isFavorite && "text-[#f5c542]",
        )}
      >
        <Star
          className="h-[18px] w-[18px]"
          fill={isFavorite ? "currentColor" : "none"}
        />
      </span>
    </>
  );
}
