"use client";

import { DeletePage } from "@/components/local/delete-page";
import { PageEditor } from "@/components/local/page-editor";
import { UpdatedAt } from "@/components/local/updated-at";
import { getLocalPageIdFromPath } from "@/lib/local-page-id";
import {
  DEFAULT_LOCAL_PAGE_TITLE,
  MISSING_MUSING,
  useLocalPage,
} from "@/lib/local-pages";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Lock, Menu, Star, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { ShareButton } from "./share-button";
import { WorkspaceSidebar } from "./sidebar";
import { isFavoritePath, type SidebarItem } from "./sidebar-data";

export function WorkspaceView({
  activePath: serverPath = "/",
  children,
  edited,
  musingItems,
  pageIcon = "👋",
  pageTitle = "hey, i’m brennen",
}: {
  activePath?: string;
  children?: ReactNode;
  edited: ReactNode;
  musingItems: SidebarItem[];
  pageIcon?: string;
  pageTitle?: string;
}) {
  const drawer = useRef<HTMLDialogElement>(null);
  const activePath = usePathname() ?? serverPath;
  const localPageId = musingItems.some((item) => item.href === activePath)
    ? undefined
    : getLocalPageIdFromPath(activePath);
  const page = useLocalPage(localPageId);
  const identity = localPageId
    ? (page ?? (page === null ? MISSING_MUSING : { title: "", emoji: "" }))
    : { title: pageTitle, emoji: pageIcon };
  const title = identity.title || DEFAULT_LOCAL_PAGE_TITLE;
  const publicTitle =
    serverPath === "/" ? SITE_NAME : `${pageTitle} · ${SITE_NAME}`;
  const favorite = isFavoritePath(activePath);

  function closeDrawer() {
    drawer.current?.close();
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <title>{localPageId ? `${title} • ${SITE_NAME}` : publicTitle}</title>
      <WorkspaceSidebar
        activePath={activePath}
        musingItems={musingItems}
        className="fixed inset-y-0 left-0 z-50 hidden w-[244px] min-[900px]:flex"
      />
      <dialog
        ref={drawer}
        aria-label="Sidebar"
        className="workspace-drawer fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent backdrop:bg-black/45"
      >
        <button
          type="button"
          aria-label="Close sidebar"
          tabIndex={-1}
          className="absolute inset-0"
          onClick={closeDrawer}
        />
        <WorkspaceSidebar
          activePath={activePath}
          musingItems={musingItems}
          onNavigate={closeDrawer}
          className="relative w-full sm:max-w-[280px]"
          headerAction={
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={closeDrawer}
              className="text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer rounded-sm p-2"
            >
              <X className="size-5" />
            </button>
          }
        />
      </dialog>
      <div className="min-h-screen min-[900px]:pl-[244px]">
        <header className="bg-background/95 text-muted-foreground sticky top-0 z-40 flex h-12 items-center justify-between gap-2 px-2 text-sm backdrop-blur min-[900px]:h-[45px] min-[900px]:px-3">
          <div
            className={cn(
              "flex min-w-0 items-center gap-1 min-[900px]:gap-2",
              localPageId && "ph-no-capture",
            )}
          >
            <button
              type="button"
              aria-label="Open sidebar"
              aria-haspopup="dialog"
              onClick={() => drawer.current?.showModal()}
              className="hover:bg-accent cursor-pointer rounded-sm p-2 min-[900px]:hidden"
            >
              <Menu className="size-5" />
            </button>
            {identity.emoji && (
              <span className="text-[18px] leading-none">{identity.emoji}</span>
            )}
            <span className="text-foreground truncate font-medium">
              {title}
            </span>
            <Lock className="hidden size-3.5 shrink-0 min-[430px]:block" />
            <span className="hidden min-[900px]:inline">Private</span>
          </div>
          <div className="flex shrink-0 items-center gap-1 min-[900px]:gap-4">
            {localPageId
              ? page && <UpdatedAt timestamp={page.updatedAt} />
              : edited}
            <ShareButton key={activePath} disabled={Boolean(localPageId)} />
            {page && <DeletePage page={page} />}
            {!localPageId && (
              <span
                aria-label={favorite ? "Favorited" : "Not favorited"}
                className={cn(
                  "hidden p-2 min-[430px]:block min-[900px]:py-1",
                  favorite && "text-[#f5c542]",
                )}
              >
                <Star
                  className="size-5 min-[900px]:size-[18px]"
                  fill={favorite ? "currentColor" : "none"}
                />
              </span>
            )}
          </div>
        </header>
        {localPageId ? <PageEditor page={page} /> : children}
      </div>
    </div>
  );
}
