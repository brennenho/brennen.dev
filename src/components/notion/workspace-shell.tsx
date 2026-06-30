import { EditedCommitLink } from "@/components/notion/edited-commit-link";
import { MobileWorkspaceTopbar } from "@/components/notion/mobile-workspace-topbar";
import { NotionSidebar } from "@/components/notion/sidebar";
import {
  isFavoritePath,
  type SidebarItem,
} from "@/components/notion/sidebar-data";
import { TopbarActions } from "@/components/notion/topbar-actions";
import { getMusingSummaries } from "@/lib/musings";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

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

const pageContentClassName = "mx-auto max-w-[900px] px-6 sm:px-8";
const pageTitleClassName =
  "text-[42px] leading-[1.12] font-bold tracking-normal text-[#f1f1ef] sm:text-[48px]";
const bodyTextClassName =
  "text-[16px] leading-[1.5] font-medium text-[#f1f1ef]";

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
    <div className="min-h-screen bg-[#191919] text-[#f1f1ef]">
      <WorkspaceSidebar activePath={activePath} musingItems={musingItems} />
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
    <header className="sticky top-0 z-40 hidden h-[45px] items-center justify-between border-b border-transparent bg-[#191919]/95 px-3 text-[14px] text-[#b3b3b1] backdrop-blur min-[900px]:flex">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[18px] leading-none">{pageIcon}</span>
        <span className="truncate font-medium text-[#efefed]">{pageTitle}</span>
        <Lock className="h-3.5 w-3.5 shrink-0 text-[#858582]" />
        <span className="hidden text-[#858582] sm:inline">Private</span>
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

function WorkspaceSidebar({
  activePath,
  musingItems,
}: {
  activePath: string;
  musingItems: SidebarItem[];
}) {
  return (
    <NotionSidebar
      activePath={activePath}
      className="fixed inset-y-0 left-0 z-50 hidden w-[244px] min-[900px]:flex"
      musingItems={musingItems}
    />
  );
}

export function PageIcon({ children }: { children: ReactNode }) {
  return (
    <div className="text-[72px] leading-none sm:text-[78px]">{children}</div>
  );
}

export function PageContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        pageContentClassName,
        "flex flex-col gap-[10px] pt-[80px] pb-24",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className={cn(pageTitleClassName, "mb-[10px]")}>{children}</h1>;
}

export function SectionSpacer() {
  return <div aria-hidden="true" className="h-6 shrink-0" />;
}

export function NotionList({ children }: { children: ReactNode }) {
  return (
    <ul className={cn("list-disc space-y-[10px] pl-6", bodyTextClassName)}>
      {children}
    </ul>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[24px] leading-tight font-bold text-[#f1f1ef] sm:text-[26px]">
      {children}
    </h2>
  );
}

export function NotionParagraph({ children }: { children: ReactNode }) {
  return <p className={bodyTextClassName}>{children}</p>;
}
