import { MobileWorkspaceTopbar } from "@/components/notion/mobile-workspace-topbar";
import { isFavoritePath, NotionSidebar } from "@/components/notion/sidebar";
import { TopbarActions } from "@/components/notion/topbar-actions";
import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  ChevronRight,
  Flower2,
  Lock,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type WorkspaceShellProps = {
  children: ReactNode;
  editedCommitTimestamp: string;
  editedCommitTitle: string;
  editedCommitUrl: string;
  editedDate: string;
  activePath?: string;
};

const pageContentClassName = "mx-auto max-w-[900px] px-6 sm:px-8";
const pageTitleClassName =
  "text-[42px] leading-[1.12] font-bold tracking-normal text-[#f1f1ef] sm:text-[48px]";
const bodyTextClassName =
  "text-[16px] leading-[1.5] font-medium text-[#f1f1ef]";

export function WorkspaceShell({
  children,
  editedCommitTimestamp,
  editedCommitTitle,
  editedCommitUrl,
  editedDate,
  activePath = "/",
}: WorkspaceShellProps) {
  const isFavorite = isFavoritePath(activePath);

  return (
    <div className="min-h-screen bg-[#191919] text-[#f1f1ef]">
      <WorkspaceSidebar activePath={activePath} />
      <div className="min-h-screen min-[900px]:pl-[244px]">
        <MobileWorkspaceTopbar
          activePath={activePath}
          editedCommitTimestamp={editedCommitTimestamp}
          editedCommitTitle={editedCommitTitle}
          editedCommitUrl={editedCommitUrl}
          editedDate={editedDate}
          isFavorite={isFavorite}
        />
        <WorkspaceTopbar
          editedCommitTimestamp={editedCommitTimestamp}
          editedCommitTitle={editedCommitTitle}
          editedCommitUrl={editedCommitUrl}
          editedDate={editedDate}
          isFavorite={isFavorite}
        />
        {children}
      </div>
    </div>
  );
}

function WorkspaceTopbar({
  editedCommitTimestamp,
  editedCommitTitle,
  editedCommitUrl,
  editedDate,
  isFavorite,
}: {
  editedCommitTimestamp: string;
  editedCommitTitle: string;
  editedCommitUrl: string;
  editedDate: string;
  isFavorite: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 hidden h-[45px] items-center justify-between border-b border-transparent bg-[#191919]/95 px-3 text-[14px] text-[#b3b3b1] backdrop-blur min-[900px]:flex">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[18px] leading-none">👋</span>
        <span className="truncate font-medium text-[#efefed]">
          hey, i’m brennen
        </span>
        <Lock className="h-3.5 w-3.5 shrink-0 text-[#858582]" />
        <span className="hidden text-[#858582] sm:inline">Private</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="group relative hidden sm:inline-block">
          <Link
            href={editedCommitUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block cursor-pointer rounded px-2 py-1 text-[#858582] transition-colors hover:bg-[#2f2f2e] hover:text-[#f1f1ef]"
            title="View on GitHub"
          >
            Edited {editedDate}
          </Link>
          <span className="absolute top-full right-0 z-50 hidden w-max max-w-[460px] pt-1.5 group-focus-within:block group-hover:block">
            <span className="block overflow-hidden rounded-lg border border-[#3a3a39] bg-[#202020] text-left text-[#b8b8b5]">
              <span className="block border-b border-[#303030] px-3 py-2 text-[13px] font-semibold text-[#b8b8b5]">
                Last Edited
              </span>
              <Link
                href={editedCommitUrl}
                target="_blank"
                rel="noreferrer"
                className="flex max-w-[360px] items-start gap-4 px-3 py-2 text-[13px] transition-colors hover:bg-[#252525]"
                title="View on GitHub"
              >
                <span className="max-w-[320px] min-w-[180px] font-semibold text-wrap text-[#f1f1ef]">
                  {editedCommitTitle}
                </span>
                <span className="shrink-0 whitespace-nowrap text-[#858582]">
                  {editedCommitTimestamp}
                </span>
              </Link>
            </span>
          </span>
        </span>
        <TopbarActions isFavorite={isFavorite} />
      </div>
    </header>
  );
}

function WorkspaceSidebar({ activePath }: { activePath: string }) {
  return (
    <NotionSidebar
      activePath={activePath}
      className="fixed inset-y-0 left-0 z-50 hidden w-[244px] min-[900px]:flex"
    />
  );
}

export function ComingSoonPage({
  description = "This page is getting its blocks in order.",
  icon,
  title,
}: {
  description?: string;
  icon: string;
  title: string;
}) {
  return (
    <main
      className={cn(
        pageContentClassName,
        "flex min-h-[calc(100vh-64px)] flex-col gap-[10px] pt-[12vh] min-[900px]:min-h-[calc(100vh-50px)] min-[900px]:pt-[18vh]",
      )}
    >
      <div className="text-[78px] leading-none">{icon}</div>
      <PageTitle>{title}</PageTitle>
      <NotionCallout icon="👀">{description} Coming soon.</NotionCallout>
    </main>
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

export function NotionCallout({
  children,
  icon = "🎯",
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-[#1f432f] px-4 py-3.5 text-[16px] leading-[1.55] font-medium text-[#f4f4f2] sm:leading-[1.5]">
      <span className="mt-0.5 text-[20px] leading-none">{icon}</span>
      <div>{children}</div>
    </div>
  );
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

export const placeholderIcons = {
  work: BriefcaseBusiness,
  nursery: Sprout,
  playground: Flower2,
  arrow: ChevronRight,
};
