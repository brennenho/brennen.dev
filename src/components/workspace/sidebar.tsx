"use client";

import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { GAME_LEADERBOARD_UPDATED_EVENT } from "@/lib/games/events";
import { createLocalPage, useLocalPages } from "@/lib/local-pages";
import { cn } from "@/lib/utils";
import { HardDrive, Mail, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { favoriteItems, type SidebarItem } from "./sidebar-data";
import { ThemeToggle } from "./theme-toggle";

export function WorkspaceSidebar({
  activePath,
  className,
  headerAction,
  musingItems,
  onNavigate,
}: {
  activePath: string;
  className?: string;
  headerAction?: ReactNode;
  musingItems: SidebarItem[];
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const localPages = useLocalPages();
  const [leaderboardHighlighted, setLeaderboardHighlighted] = useState(false);

  useEffect(() => {
    function handleLeaderboardUpdated() {
      setLeaderboardHighlighted(true);
    }

    window.addEventListener(
      GAME_LEADERBOARD_UPDATED_EVENT,
      handleLeaderboardUpdated,
    );

    return () => {
      window.removeEventListener(
        GAME_LEADERBOARD_UPDATED_EVENT,
        handleLeaderboardUpdated,
      );
    };
  }, []);

  useEffect(() => {
    if (!leaderboardHighlighted) return;

    const id = window.setTimeout(() => {
      setLeaderboardHighlighted(false);
    }, 3000);

    return () => window.clearTimeout(id);
  }, [leaderboardHighlighted]);

  function handleNavigate() {
    setLeaderboardHighlighted(false);
    onNavigate?.();
  }

  function handleCreatePage() {
    const page = createLocalPage("sidebar");
    router.push(`/musings/${page.id}`);
    handleNavigate();
  }

  return (
    <aside
      className={cn(
        "border-sidebar-border bg-sidebar text-sidebar-foreground flex h-full flex-col border-r",
        className,
      )}
    >
      <div className="flex h-[45px] items-center justify-between px-3">
        <Link
          href="/"
          className="text-foreground flex min-w-0 items-center gap-2.5 text-[14px] font-semibold"
          onClick={onNavigate}
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
        {headerAction}
      </div>

      <nav className="flex flex-1 flex-col gap-9 px-2 pt-10 text-[14px] font-semibold">
        <SidebarGroup title="Favorites">
          {favoriteItems.map((item) => (
            <SidebarLink
              key={item.href}
              active={activePath === item.href}
              highlighted={
                leaderboardHighlighted && item.href === "/leaderboard"
              }
              item={item}
              onNavigate={handleNavigate}
            />
          ))}
        </SidebarGroup>

        <SidebarGroup
          action={
            <button
              type="button"
              aria-label="New page"
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer rounded p-1 transition-colors"
              onClick={handleCreatePage}
            >
              <Plus className="h-4 w-4" />
            </button>
          }
          title="Musings"
        >
          {musingItems.map((item) => (
            <SidebarLink
              key={item.href}
              active={activePath === item.href}
              item={item}
              onNavigate={handleNavigate}
            />
          ))}
          {localPages.map((page) => (
            <SidebarLink
              key={page.id}
              active={activePath === `/musings/${page.id}`}
              item={{
                href: `/musings/${page.id}`,
                icon: page.emoji,
                label: page.title || "Untitled",
              }}
              onNavigate={handleNavigate}
              trailing={
                <HardDrive
                  aria-label="Saved in this browser"
                  className="text-muted-foreground ml-auto h-3.5 w-3.5 shrink-0"
                />
              }
            />
          ))}
        </SidebarGroup>
      </nav>

      <div className="border-sidebar-border border-t px-4 py-3">
        <div className="text-sidebar-foreground flex items-center gap-3.5">
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
          <ThemeToggle />
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
      <div className="text-muted-foreground mb-1.5 flex items-center justify-between px-2 text-[12px] font-semibold">
        <span>{title}</span>
        {action}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function SidebarLink({
  active,
  highlighted = false,
  item,
  onNavigate,
  trailing,
}: {
  active: boolean;
  highlighted?: boolean;
  item: SidebarItem;
  onNavigate?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "text-sidebar-foreground hover:bg-sidebar-accent relative flex h-8 items-center gap-2 rounded-sm px-2 transition-[background-color,box-shadow,color] duration-300",
        active && "bg-sidebar-primary text-sidebar-primary-foreground",
        highlighted &&
          "text-sidebar-primary-foreground bg-[#fbf3db] shadow-[0_0_0_1px_rgba(245,197,66,0.28),0_0_18px_rgba(245,197,66,0.16)] dark:bg-[#3d3726]",
      )}
    >
      <span className="w-5 text-[18px] leading-none">{item.icon}</span>
      <span className="truncate">{item.label}</span>
      {trailing}
      {highlighted ? (
        <>
          <span
            aria-hidden="true"
            className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f5c542] shadow-[0_0_10px_rgba(245,197,66,0.75)]"
          />
          <span className="animate-in fade-in slide-in-from-left-1 border-border bg-popover text-popover-foreground pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden -translate-y-1/2 rounded-sm border px-2.5 py-1.5 text-[12px] leading-none font-semibold whitespace-nowrap shadow-lg min-[900px]:block">
            Saved new high score
          </span>
        </>
      ) : null}
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
