import { getMusingSummaries } from "@/lib/musings";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { EditedCommitLink } from "./edited-commit-link";
import { MobileWorkspaceTopbar } from "./mobile-workspace-topbar";
import { WorkspaceSidebar as WorkspaceSidebarNav } from "./sidebar";
import { isFavoritePath, type SidebarItem } from "./sidebar-data";
import { TopbarActions } from "./topbar-actions";

type WorkspaceShellProps = {
  children: ReactNode;
  editedCommitDate: string;
  editedCommitTimestamp: string;
  editedCommitTitle: string;
  editedCommitUrl: string;
  editedDate: string;
  activePath?: string;
  pageIcon?: string;
  pageTitle?: string;
};

export async function WorkspaceShell({
  children,
  editedCommitDate,
  editedCommitTimestamp,
  editedCommitTitle,
  editedCommitUrl,
  editedDate,
  activePath = "/",
  pageIcon = "👋",
  pageTitle = "hey, i’m brennen",
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
    <div className="min-h-screen bg-background text-foreground">
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
          musingItems={musingItems}
          pageIcon={pageIcon}
          pageTitle={pageTitle}
        />
        <WorkspaceTopbar
          editedCommitDate={editedCommitDate}
          editedCommitTimestamp={editedCommitTimestamp}
          editedCommitTitle={editedCommitTitle}
          editedCommitUrl={editedCommitUrl}
          editedDate={editedDate}
          isFavorite={isFavorite}
          pageIcon={pageIcon}
          pageTitle={pageTitle}
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
  pageIcon,
  pageTitle,
}: {
  editedCommitDate: string;
  editedCommitTimestamp: string;
  editedCommitTitle: string;
  editedCommitUrl: string;
  editedDate: string;
  isFavorite: boolean;
  pageIcon: string;
  pageTitle: string;
}) {
  return (
    <header className="sticky top-0 z-40 hidden h-[45px] items-center justify-between border-b border-transparent bg-background/95 px-3 text-[14px] text-muted-foreground backdrop-blur min-[900px]:flex">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[18px] leading-none">{pageIcon}</span>
        <span className="truncate font-medium text-foreground">
          {pageTitle}
        </span>
        <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="hidden text-muted-foreground sm:inline">Private</span>
      </div>

      <div className="flex items-center gap-4">
        <EditedCommitLink
          commitDate={editedCommitDate}
          commitTitle={editedCommitTitle}
          commitUrl={editedCommitUrl}
          fallbackDateLabel={editedDate}
          fallbackTimestamp={editedCommitTimestamp}
          variant="desktop"
        />
        <TopbarActions isFavorite={isFavorite} />
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
