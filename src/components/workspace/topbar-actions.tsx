"use client";

import { DeletePage } from "@/components/local/delete-page";
import { useLocalPage } from "@/lib/local-pages";
import { cn } from "@/lib/utils";
import { Check, Share2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TopbarActionsProps = {
  isFavorite: boolean;
  localPageId?: string;
};

export function TopbarActions({ isFavorite, localPageId }: TopbarActionsProps) {
  const router = useRouter();
  const localPage = useLocalPage(localPageId ?? "");
  const [copied, setCopied] = useState(false);
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
      <button
        type="button"
        aria-label={
          shareDisabled
            ? "Share unavailable for local pages"
            : showCopied
              ? "Copied page link"
              : "Copy page link"
        }
        title={
          shareDisabled ? "Local pages are private to this browser" : undefined
        }
        disabled={shareDisabled}
        onClick={copyPageLink}
        className="focus-visible:outline-ring enabled:hover:bg-accent enabled:hover:text-foreground min-[900px]:text-foreground inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded font-medium transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-40 min-[900px]:h-8 min-[900px]:w-16"
      >
        <ShareIcon className="size-[18px] min-[900px]:hidden" />
        <span className="hidden min-[900px]:inline">
          {showCopied ? "Copied" : "Share"}
        </span>
      </button>
      {localPageId ? (
        localPage && (
          <DeletePage page={localPage} onDeleted={() => router.push("/")} />
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
