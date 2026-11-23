"use client";

import { cn } from "@/lib/utils";
import { Check, Lock, Menu, Share2, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EditedCommitLink } from "./edited-commit-link";
import { LocalPageUpdatedAt } from "./local-page-updated-at";
import { PageIdentity } from "./page-identity";
import { WorkspaceSidebar } from "./sidebar";
import type { SidebarItem } from "./sidebar-data";

type MobileWorkspaceTopbarProps = {
  activePath: string;
  editedCommitDate: string;
  editedCommitTimestamp: string;
  editedCommitTitle: string;
  editedCommitUrl: string;
  editedDate: string;
  isFavorite: boolean;
  localPageId?: string;
  musingItems: SidebarItem[];
  pageIcon: string;
  pageTitle: string;
  shareUrl?: string;
};

export function MobileWorkspaceTopbar({
  activePath,
  editedCommitDate,
  editedCommitTimestamp,
  editedCommitTitle,
  editedCommitUrl,
  editedDate,
  isFavorite,
  localPageId,
  musingItems,
  pageIcon,
  pageTitle,
  shareUrl,
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
      await navigator.clipboard.writeText(shareUrl ?? window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <header className="bg-background/95 text-muted-foreground sticky top-0 z-40 flex h-12 items-center justify-between border-b border-transparent px-2 text-[14px] backdrop-blur min-[900px]:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setOpen(true)}
            className="text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer rounded-sm p-2 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <PageIdentity
            icon={pageIcon}
            localPageId={localPageId}
            title={pageTitle}
          />
          <Lock className="text-muted-foreground hidden h-3.5 w-3.5 shrink-0 min-[430px]:block" />
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-1">
          {localPageId ? (
            <LocalPageUpdatedAt id={localPageId} variant="mobile" />
          ) : (
            <EditedCommitLink
              commitDate={editedCommitDate}
              commitTitle={editedCommitTitle}
              commitUrl={editedCommitUrl}
              fallbackDateLabel={editedDate}
              fallbackTimestamp={editedCommitTimestamp}
              variant="mobile"
            />
          )}
          <button
            type="button"
            aria-label={copied ? "Copied page link" : "Copy page link"}
            onClick={copyPageLink}
            className="text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer rounded-sm p-2 transition-colors"
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
              "text-muted-foreground hidden p-2 min-[430px]:block",
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
          <WorkspaceSidebar
            activePath={activePath}
            className="relative w-full sm:w-[92vw] sm:max-w-[280px]"
            headerAction={
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setOpen(false)}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer rounded-sm p-2 transition-colors"
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
