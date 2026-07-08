"use client";

import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { GAME_LEADERBOARD_UPDATED_EVENT } from "@/lib/games/events";
import { cn } from "@/lib/utils";
import { Mail, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-[45px] items-center justify-between px-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-[14px] font-semibold text-foreground"
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
            <button aria-label="Add musing" className="rounded p-1">
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
        </SidebarGroup>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3.5 text-sidebar-foreground">
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
      <div className="mb-1.5 flex items-center justify-between px-2 text-[12px] font-semibold text-muted-foreground">
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
}: {
  active: boolean;
  highlighted?: boolean;
  item: SidebarItem;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "relative flex h-8 items-center gap-2 rounded-sm px-2 text-sidebar-foreground transition-[background-color,box-shadow,color] duration-300 hover:bg-sidebar-accent",
        active && "bg-sidebar-primary text-sidebar-primary-foreground",
        highlighted &&
          "bg-[#fbf3db] text-sidebar-primary-foreground shadow-[0_0_0_1px_rgba(245,197,66,0.28),0_0_18px_rgba(245,197,66,0.16)] dark:bg-[#3d3726]",
      )}
    >
      <span className="w-5 text-[18px] leading-none">{item.icon}</span>
      <span className="truncate">{item.label}</span>
      {highlighted ? (
        <>
          <span
            aria-hidden="true"
            className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f5c542] shadow-[0_0_10px_rgba(245,197,66,0.75)]"
          />
          <span className="animate-in fade-in slide-in-from-left-1 pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden -translate-y-1/2 rounded-sm border border-border bg-popover px-2.5 py-1.5 text-[12px] leading-none font-semibold whitespace-nowrap text-popover-foreground shadow-lg min-[900px]:block">
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
