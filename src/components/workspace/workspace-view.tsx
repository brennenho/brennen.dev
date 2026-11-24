"use client";

import { DeletePage } from "@/components/local/delete-page";
import { UpdatedAt } from "@/components/local/updated-at";
import { useLocalPage } from "@/lib/local-pages";
import { cn } from "@/lib/utils";
import { Lock, Menu, Star, X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { ShareButton } from "./share-button";
import { WorkspaceSidebar } from "./sidebar";
import { isFavoritePath, type SidebarItem } from "./sidebar-data";

export function WorkspaceView({
  activePath = "/",
  children,
  edited,
  localPageId,
  musingItems,
  pageIcon = "👋",
  pageTitle = "hey, i’m brennen",
}: {
  activePath?: string;
  children: ReactNode;
  edited: ReactNode;
  localPageId?: string;
  musingItems: SidebarItem[];
  pageIcon?: string;
  pageTitle?: string;
}) {
  const drawer = useRef<HTMLDialogElement>(null);
  const page = useLocalPage(localPageId);
  const icon = page?.emoji ?? pageIcon;
  const { title = "" } = page ?? {};
  const favorite = isFavoritePath(activePath);
  function closeDrawer() {
    drawer.current?.close();
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
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
            {icon && <span className="text-[18px] leading-none">{icon}</span>}
            <span className="text-foreground truncate font-medium">
              {title || pageTitle}
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
        {children}
      </div>
    </div>
  );
}
