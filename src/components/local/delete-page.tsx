"use client";

import {
  DEFAULT_LOCAL_PAGE_TITLE,
  deleteLocalPage,
  type LocalPage,
} from "@/lib/local-pages";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeletePage({
  page,
  sidebar = false,
  active = true,
  onNavigate,
}: {
  page: LocalPage;
  sidebar?: boolean;
  active?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const title = page.title || DEFAULT_LOCAL_PAGE_TITLE;
  const label = sidebar ? `Delete “${title}”` : "Delete page";

  function handleDelete() {
    if (!window.confirm(`Delete “${title}” from this browser?`)) return;
    deleteLocalPage(page.id);
    if (active) {
      router.replace("/");
      onNavigate?.();
    }
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleDelete}
      className={cn(
        "ph-no-capture text-muted-foreground hover:text-destructive focus-visible:outline-ring inline-flex shrink-0 cursor-pointer items-center justify-center rounded transition-colors focus-visible:outline-2",
        sidebar
          ? "size-8"
          : "hover:bg-destructive/10 size-10 min-[900px]:size-8",
      )}
    >
      <Trash2
        aria-hidden="true"
        className={sidebar ? "size-3.5" : "size-[18px]"}
      />
    </button>
  );
}
