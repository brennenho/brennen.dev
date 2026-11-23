import { getMusingSummaries } from "@/lib/musings";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { EditedCommitLink } from "./edited-commit-link";
import { LocalPageUpdatedAt } from "./local-page-updated-at";
import { MobileWorkspaceTopbar } from "./mobile-workspace-topbar";
import { PageIdentity } from "./page-identity";
import { WorkspaceSidebar as WorkspaceSidebarNav } from "./sidebar";
import { isFavoritePath, type SidebarItem } from "./sidebar-data";
import { TopbarActions } from "./topbar-actions";

type WorkspaceShellProps = {
  children: ReactNode;
  editedCommitDate?: string;
  editedCommitTimestamp?: string;
  editedCommitTitle?: string;
  editedCommitUrl?: string;
  editedDate?: string;
  activePath?: string;
  localPageId?: string;
  pageIcon?: string;
  pageTitle?: string;
  shareUrl?: string;
};

export async function WorkspaceShell({
  children,
  editedCommitDate = "",
  editedCommitTimestamp = "",
  editedCommitTitle = "",
  editedCommitUrl = "",
  editedDate = "",
  activePath = "/",
  localPageId,
  pageIcon = "👋",
  pageTitle = "hey, i’m brennen",
  shareUrl,
}: WorkspaceShellProps) {
  const isFavorite = isFavoritePath(activePath);
  const musingItems: SidebarItem[] = (await getMusingSummaries()).map(
    (post) => ({
      href: post.href,
      icon: post.emoji,
      label: post.label,
    }),
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      <DesktopWorkspaceSidebar
        activePath={activePath}
        musingItems={musingItems}
      />
      <div className="min-h-screen min-[900px]:pl-[244px]">
        <MobileWorkspaceTopbar
          activePath={activePath}
          editedCommitDate={editedCommitDate}
          editedCommitTimestamp={editedCommitTimestamp}
          editedCommitTitle={editedCommitTitle}
          editedCommitUrl={editedCommitUrl}
          editedDate={editedDate}
          isFavorite={isFavorite}
          localPageId={localPageId}
          musingItems={musingItems}
          pageIcon={pageIcon}
          pageTitle={pageTitle}
          shareUrl={shareUrl}
        />
        <WorkspaceTopbar
          editedCommitDate={editedCommitDate}
          editedCommitTimestamp={editedCommitTimestamp}
          editedCommitTitle={editedCommitTitle}
          editedCommitUrl={editedCommitUrl}
          editedDate={editedDate}
          isFavorite={isFavorite}
          localPageId={localPageId}
          pageIcon={pageIcon}
          pageTitle={pageTitle}
          shareUrl={shareUrl}
        />
        {children}
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
  shareUrl,
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
  shareUrl?: string;
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
          <LocalPageUpdatedAt id={localPageId} variant="desktop" />
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
        <TopbarActions isFavorite={isFavorite} shareUrl={shareUrl} />
      </div>
    </header>
  );
}

function DesktopWorkspaceSidebar({
  activePath,
  musingItems,
}: {
  activePath: string;
  musingItems: SidebarItem[];
}) {
  return (
    <WorkspaceSidebarNav
      activePath={activePath}
      className="fixed inset-y-0 left-0 z-50 hidden w-[244px] min-[900px]:flex"
      musingItems={musingItems}
    />
  );
}
