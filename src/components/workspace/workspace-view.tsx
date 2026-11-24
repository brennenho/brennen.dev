"use client";

import { PageEditor } from "@/components/local/page-editor";
import { UpdatedAt } from "@/components/local/updated-at";
import { getLocalPageIdFromPath } from "@/lib/local-page-id";
import { DEFAULT_LOCAL_PAGE_TITLE, SITE_NAME } from "@/lib/site";
import { Lock } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { EditedCommitLink } from "./edited-commit-link";
import { MobileWorkspaceTopbar } from "./mobile-workspace-topbar";
import { PageIdentity } from "./page-identity";
import { WorkspaceSidebar } from "./sidebar";
import { isFavoritePath, type SidebarItem } from "./sidebar-data";
import { TopbarActions } from "./topbar-actions";

export type WorkspacePageProps = {
  children?: ReactNode;
  editedCommitDate?: string;
  editedCommitTimestamp?: string;
  editedCommitTitle?: string;
  editedCommitUrl?: string;
  editedDate?: string;
  activePath?: string;
  pageIcon?: string;
  pageTitle?: string;
};

export function WorkspaceView({
  children,
  editedCommitDate = "",
  editedCommitTimestamp = "",
  editedCommitTitle = "",
  editedCommitUrl = "",
  editedDate = "",
  activePath: serverPath = "/",
  pageIcon = "👋",
  pageTitle = "hey, i’m brennen",
  musingItems,
}: WorkspacePageProps & { musingItems: SidebarItem[] }) {
  const activePath = usePathname() ?? serverPath;
  const localPageId = musingItems.some((item) => item.href === activePath)
    ? undefined
    : getLocalPageIdFromPath(activePath);
  const topbar = {
    editedCommitDate,
    editedCommitTimestamp,
    editedCommitTitle,
    editedCommitUrl,
    editedDate,
    isFavorite: isFavoritePath(activePath),
    localPageId,
    pageIcon: localPageId ? "" : pageIcon,
    pageTitle: localPageId ? DEFAULT_LOCAL_PAGE_TITLE : pageTitle,
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <WorkspaceSidebar
        activePath={activePath}
        className="fixed inset-y-0 left-0 z-50 hidden w-[244px] min-[900px]:flex"
        musingItems={musingItems}
      />
      <div className="min-h-screen min-[900px]:pl-[244px]">
        <MobileWorkspaceTopbar
          {...topbar}
          activePath={activePath}
          musingItems={musingItems}
        />
        <WorkspaceTopbar {...topbar} />
        {localPageId ? (
          <PageEditor id={localPageId} />
        ) : (
          <>
            <title>
              {serverPath === "/" ? SITE_NAME : `${pageTitle} · ${SITE_NAME}`}
            </title>
            {children}
          </>
        )}
      </div>
    </div>
  );
}

function WorkspaceTopbar({
  editedCommitDate,
  editedCommitTimestamp,
  editedCommitTitle,
  editedCommitUrl,
  editedDate,
  isFavorite,
  localPageId,
  pageIcon,
  pageTitle,
}: {
  editedCommitDate: string;
  editedCommitTimestamp: string;
  editedCommitTitle: string;
  editedCommitUrl: string;
  editedDate: string;
  isFavorite: boolean;
  localPageId?: string;
  pageIcon: string;
  pageTitle: string;
}) {
  return (
    <header className="bg-background/95 text-muted-foreground sticky top-0 z-40 hidden h-[45px] items-center justify-between border-b border-transparent px-3 text-[14px] backdrop-blur min-[900px]:flex">
      <div className="flex min-w-0 items-center gap-2">
        <PageIdentity
          icon={pageIcon}
          localPageId={localPageId}
          title={pageTitle}
        />
        <Lock className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        <span className="text-muted-foreground hidden sm:inline">Private</span>
      </div>

      <div className="flex items-center gap-4">
        {localPageId ? (
          <UpdatedAt id={localPageId} />
        ) : (
          <EditedCommitLink
            commitDate={editedCommitDate}
            commitTitle={editedCommitTitle}
            commitUrl={editedCommitUrl}
            fallbackDateLabel={editedDate}
            fallbackTimestamp={editedCommitTimestamp}
            variant="desktop"
          />
        )}
        <TopbarActions isFavorite={isFavorite} localPageId={localPageId} />
      </div>
    </header>
  );
}
