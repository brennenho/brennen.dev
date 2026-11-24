"use client";

import { DeletePage } from "@/components/local/delete-page";
import { useLocalPage } from "@/lib/local-pages";
import { cn } from "@/lib/utils";
import { Check, Share2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

type TopbarActionsProps = {
  isFavorite: boolean;
  localPageId?: string;
};

export function TopbarActions({ isFavorite, localPageId }: TopbarActionsProps) {
  const router = useRouter();
  const localPage = useLocalPage(localPageId ?? "");
  const [copied, setCopied] = useState(false);
  const shareNoteId = useId();
  const shareDisabled = Boolean(localPageId);
  const showCopied = copied && !shareDisabled;
  const ShareIcon = showCopied ? Check : Share2;

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
      <span className="group relative inline-flex">
        <button
          type="button"
          aria-label={
            shareDisabled
              ? "Share unavailable for local pages"
              : showCopied
                ? "Copied page link"
                : "Copy page link"
          }
          aria-disabled={shareDisabled || undefined}
          aria-describedby={shareDisabled ? shareNoteId : undefined}
          onClick={shareDisabled ? undefined : copyPageLink}
          className={cn(
            "focus-visible:outline-ring min-[900px]:text-foreground inline-flex size-10 shrink-0 items-center justify-center rounded font-medium transition-colors focus-visible:outline-2 min-[900px]:h-8 min-[900px]:w-16",
            shareDisabled
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-accent hover:text-foreground cursor-pointer",
          )}
        >
          <ShareIcon className="size-[18px] min-[900px]:hidden" />
          <span className="hidden min-[900px]:inline">
            {showCopied ? "Copied" : "Share"}
          </span>
        </button>
        {shareDisabled && (
          <span
            id={shareNoteId}
            role="tooltip"
            className="absolute top-full right-0 z-50 hidden w-max max-w-56 pt-1.5 group-focus-within:block group-hover:block"
          >
            <span className="bg-popover text-popover-foreground border-border block rounded-md border px-3 py-2 text-xs font-medium shadow-md">
              Local musings can&apos;t be shared.
            </span>
          </span>
        )}
      </span>
      {localPageId ? (
        localPage && (
          <DeletePage page={localPage} onDeleted={() => router.replace("/")} />
        )
      ) : (
        <span
          aria-label={isFavorite ? "Favorited" : "Not favorited"}
          className={cn(
            "text-muted-foreground hidden p-2 min-[430px]:block min-[900px]:py-1",
            isFavorite && "text-[#f5c542]",
          )}
        >
          <Star
            className="size-5 min-[900px]:size-[18px]"
            fill={isFavorite ? "currentColor" : "none"}
          />
        </span>
      )}
    </>
  );
}
