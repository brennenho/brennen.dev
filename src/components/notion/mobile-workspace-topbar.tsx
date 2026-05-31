"use client";

import { EditedCommitLink } from "@/components/notion/edited-commit-link";
import { NotionSidebar, type SidebarItem } from "@/components/notion/sidebar";
import { cn } from "@/lib/utils";
import { Check, Lock, Menu, Share2, Star, X } from "lucide-react";
import { useEffect, useState } from "react";

type MobileWorkspaceTopbarProps = {
  activePath: string;
  editedCommitDate: string;
  editedCommitTimestamp: string;
  editedCommitTitle: string;
  editedCommitUrl: string;
  editedDate: string;
  isFavorite: boolean;
  musingItems: SidebarItem[];
};

export function MobileWorkspaceTopbar({
  activePath,
  editedCommitDate,
  editedCommitTimestamp,
  editedCommitTitle,
  editedCommitUrl,
  editedDate,
  isFavorite,
  musingItems,
}: MobileWorkspaceTopbarProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const id = window.setTimeout(() => setCopied(false), 1400);

    return () => window.clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-transparent bg-[#191919]/95 px-2 text-[14px] text-[#b3b3b1] backdrop-blur min-[900px]:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setOpen(true)}
            className="cursor-pointer rounded-sm p-2 text-[#d6d6d4] transition-colors hover:bg-[#2f2f2e] hover:text-[#f1f1ef]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-[18px] leading-none">👋</span>
          <span className="min-w-0 truncate font-medium text-[#efefed]">
            hey, i’m brennen
          </span>
          <Lock className="hidden h-3.5 w-3.5 shrink-0 text-[#858582] min-[430px]:block" />
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-1">
          <EditedCommitLink
            commitDate={editedCommitDate}
            commitTitle={editedCommitTitle}
            commitUrl={editedCommitUrl}
            fallbackDateLabel={editedDate}
            fallbackTimestamp={editedCommitTimestamp}
            variant="mobile"
          />
          <button
            type="button"
            aria-label={copied ? "Copied page link" : "Copy page link"}
            onClick={copyPageLink}
            className="cursor-pointer rounded-sm p-2 text-[#d6d6d4] transition-colors hover:bg-[#2f2f2e] hover:text-[#f1f1ef]"
          >
            {copied ? (
              <Check className="h-[18px] w-[18px]" />
            ) : (
              <Share2 className="h-[18px] w-[18px]" />
            )}
          </button>
          <span
            aria-label={isFavorite ? "Favorited" : "Not favorited"}
            className={cn(
              "hidden p-2 text-[#d6d6d4] min-[430px]:block",
              isFavorite && "text-[#f5c542]",
            )}
          >
            <Star
              className="h-5 w-5"
              fill={isFavorite ? "currentColor" : "none"}
            />
          </span>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 min-[900px]:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/45"
            onClick={() => setOpen(false)}
          />
          <NotionSidebar
            activePath={activePath}
            className="relative w-full sm:w-[92vw] sm:max-w-[280px]"
            headerAction={
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-sm p-2 text-[#d6d6d4] transition-colors hover:bg-[#30302f] hover:text-[#f1f1ef]"
              >
                <X className="h-5 w-5" />
              </button>
            }
            musingItems={musingItems}
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}
