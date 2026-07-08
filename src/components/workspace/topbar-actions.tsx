"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

type TopbarActionsProps = {
  isFavorite: boolean;
};

const actionClassName =
  "cursor-pointer rounded px-2 py-1 transition-colors hover:bg-accent hover:text-foreground";

export function TopbarActions({ isFavorite }: TopbarActionsProps) {
  const [copied, setCopied] = useState(false);

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
    <>
      <button
        type="button"
        onClick={copyPageLink}
        className={cn(
          "inline-flex w-16 justify-center font-medium text-foreground",
          actionClassName,
        )}
      >
        {copied ? "Copied" : "Share"}
      </button>
      <span
        aria-label={isFavorite ? "Favorited" : "Not favorited"}
        className={cn(
          "px-2 py-1 text-muted-foreground",
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
