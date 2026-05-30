import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { MobileWorkspaceTopbar } from "@/components/notion/mobile-workspace-topbar";
import { TopbarActions } from "@/components/notion/topbar-actions";
import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  ChevronRight,
  Flower2,
  Lock,
  Mail,
  Plus,
  Sprout,
} from "lucide-react";
import Image from "next/image";
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

const favorites = [
  { href: "/", icon: "👋", label: "hey, i’m brennen" },
  { href: "/work", icon: "💼", label: "work" },
  { href: "/nursery", icon: "🌱", label: "nursery" },
  { href: "/playground", icon: "🛝", label: "playground" },
];

const musings = [
  {
    href: "/musings/summer-in-the-city",
    icon: "🌉",
    label: "summer in the city - jun ’26",
  },
  {
    href: "/musings/side-quests",
    icon: "🕵️",
    label: "side quests - apr ’26",
  },
  { href: "/musings/watchlist", icon: "👀", label: "watchlist - feb ’26" },
  {
    href: "/musings/new-beginnings",
    icon: "🌻",
    label: "new beginnings - jan ’26",
  },
];

export function WorkspaceShell({
  children,
  editedCommitTimestamp,
  editedCommitTitle,
  editedCommitUrl,
  editedDate,
  activePath = "/",
}: WorkspaceShellProps) {
  const isFavorite = favorites.some((item) => item.href === activePath);

  return (
    <div className="min-h-screen bg-[#191919] text-[#f1f1ef]">
      <WorkspaceSidebar activePath={activePath} />
      <div className="min-h-screen lg:pl-[244px]">
        <MobileWorkspaceTopbar
          activePath={activePath}
          editedCommitTimestamp={editedCommitTimestamp}
          editedCommitTitle={editedCommitTitle}
          editedCommitUrl={editedCommitUrl}
          editedDate={editedDate}
          favorites={favorites}
          isFavorite={isFavorite}
          musings={musings}
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
    <header className="sticky top-0 z-40 hidden h-[45px] items-center justify-between border-b border-transparent bg-[#191919]/95 px-3 text-[14px] text-[#b3b3b1] backdrop-blur lg:flex">
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
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[244px] flex-col border-r border-[#2b2b2b] bg-[#202020] text-[#b8b8b5] lg:flex">
      <div className="flex h-[45px] items-center justify-between px-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-[14px] font-semibold text-[#f1f1ef]"
        >
          <Image
            src="/img/notion.png"
            alt="Notion"
            width={24}
            height={24}
            className="h-6 w-6 rounded-sm"
          />
          <span className="truncate">brennen’s notion</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-9 px-2 pt-10 text-[14px] font-semibold">
        <SidebarGroup title="Favorites">
          {favorites.map((item) => (
            <SidebarLink
              key={item.href}
              active={activePath === item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </SidebarGroup>

        <SidebarGroup
          action={
            <button aria-label="Add musing" className="rounded p-1">
              <Plus className="h-4 w-4" />
            </button>
          }
          title="Musings"
        >
          {musings.map((item) => (
            <SidebarLink
              key={item.href}
              active={activePath === item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </SidebarGroup>
      </nav>

      <div className="border-t border-[#303030] px-4 py-3">
        <div className="flex items-center gap-3.5 text-[#c7c7c5]">
          <SocialLink href="mailto:web@brennen.dev" label="Email">
            <Mail className="h-4.5 w-4.5" />
          </SocialLink>
          <SocialLink
            href="https://www.linkedin.com/in/brennenho/"
            label="LinkedIn"
          >
            <LinkedInIcon className="h-4.5 w-4.5" />
          </SocialLink>
          <SocialLink href="https://github.com/brennenho" label="GitHub">
            <GithubIcon className="h-4.5 w-4.5" />
          </SocialLink>
          <SocialLink href="https://x.com/brennenho_" label="X">
            <XIcon className="h-4.5 w-4.5" />
          </SocialLink>
        </div>
      </div>
    </aside>
  );
}

function SidebarGroup({
  action,
  children,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between px-2 text-[12px] font-semibold text-[#9b9b98]">
        <span>{title}</span>
        {action}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function SidebarLink({
  active,
  href,
  icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-8 items-center gap-2 rounded-sm px-2 text-[#b8b8b5] transition-colors hover:bg-[#30302f]",
        active && "bg-[#373736] text-[#f1f1ef]",
      )}
    >
      <span className="w-5 text-[18px] leading-none">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SocialLink({
  children,
  href,
  label,
}: {
  children: ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {children}
    </Link>
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
        "flex min-h-[calc(100vh-64px)] flex-col pt-[12vh] lg:min-h-[calc(100vh-50px)] lg:pt-[18vh]",
      )}
    >
      <div className="mb-4 text-[78px] leading-none">{icon}</div>
      <h1 className={cn(pageTitleClassName, "mb-6")}>{title}</h1>
      <NotionCallout icon="👀">{description} Coming soon.</NotionCallout>
    </main>
  );
}

export function PageIcon({ children }: { children: ReactNode }) {
  return (
    <div className="text-[72px] leading-none sm:text-[78px]">{children}</div>
  );
}

export function PageContent({ children }: { children: ReactNode }) {
  return (
    <article className={cn(pageContentClassName, "pt-16 pb-24 md:pt-[104px]")}>
      {children}
    </article>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className={cn(pageTitleClassName, "mb-6")}>{children}</h1>;
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
    <ul
      className={cn(
        "mt-4 list-disc space-y-4 pl-6 sm:space-y-3",
        bodyTextClassName,
      )}
    >
      {children}
    </ul>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-14 text-[24px] leading-tight font-bold text-[#f1f1ef] sm:text-[26px]">
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
