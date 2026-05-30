"use client";

import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Lock, Mail, Menu, Plus, Share2, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

type MobileWorkspaceTopbarProps = {
  activePath: string;
  editedCommitTimestamp: string;
  editedCommitTitle: string;
  editedCommitUrl: string;
  editedDate: string;
  favorites: NavItem[];
  isFavorite: boolean;
  musings: NavItem[];
};

export function MobileWorkspaceTopbar({
  activePath,
  editedCommitTimestamp,
  editedCommitTitle,
  editedCommitUrl,
  editedDate,
  favorites,
  isFavorite,
  musings,
}: MobileWorkspaceTopbarProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const id = window.setTimeout(() => setCopied(false), 1400);

    return () => window.clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function copyPageLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-transparent bg-[#191919]/95 px-2 text-[14px] text-[#b3b3b1] backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setOpen(true)}
            className="rounded-sm p-2 text-[#d6d6d4] transition-colors hover:bg-[#2f2f2e] hover:text-[#f1f1ef]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-[18px] leading-none">👋</span>
          <span className="max-w-16 truncate font-medium text-[#efefed] min-[360px]:max-w-24 min-[430px]:max-w-[180px]">
            hey, i’m brennen
          </span>
          <Lock className="hidden h-3.5 w-3.5 shrink-0 text-[#858582] min-[430px]:block" />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={editedCommitUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded px-2 py-1 text-[#858582] transition-colors hover:bg-[#2f2f2e] hover:text-[#f1f1ef]"
            title={`${editedCommitTitle} - ${editedCommitTimestamp}`}
          >
            Edited {editedDate}
          </Link>
          <button
            type="button"
            aria-label={copied ? "Copied page link" : "Copy page link"}
            onClick={copyPageLink}
            className="cursor-pointer rounded-sm p-2 text-[#d6d6d4] transition-colors hover:bg-[#2f2f2e] hover:text-[#f1f1ef]"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
          <span
            aria-label={isFavorite ? "Favorited" : "Not favorited"}
            className={cn(
              "hidden p-2 text-[#d6d6d4] min-[430px]:block",
              isFavorite && "text-[#f5c542]",
            )}
          >
            <Star
              className="h-5 w-5"
              fill={isFavorite ? "currentColor" : "none"}
            />
          </span>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/45"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[92vw] max-w-none flex-col border-r border-[#2b2b2b] bg-[#202020] text-[#b8b8b5]">
            <div className="flex h-[45px] items-center justify-between px-3">
              <Link
                href="/"
                className="flex min-w-0 items-center gap-2.5 text-[14px] font-semibold text-[#f1f1ef]"
                onClick={() => setOpen(false)}
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
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-sm p-2 text-[#d6d6d4] transition-colors hover:bg-[#30302f] hover:text-[#f1f1ef]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-9 px-2 pt-10 text-[14px] font-semibold">
              <MobileSidebarGroup title="Favorites">
                {favorites.map((item) => (
                  <MobileSidebarLink
                    key={item.href}
                    active={activePath === item.href}
                    item={item}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </MobileSidebarGroup>

              <MobileSidebarGroup
                action={
                  <button aria-label="Add musing" className="rounded p-1">
                    <Plus className="h-4 w-4" />
                  </button>
                }
                title="Musings"
              >
                {musings.map((item) => (
                  <MobileSidebarLink
                    key={item.href}
                    active={activePath === item.href}
                    item={item}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </MobileSidebarGroup>
            </nav>

            <div className="border-t border-[#303030] px-4 py-3">
              <div className="flex items-center gap-3.5 text-[#c7c7c5]">
                <MobileSocialLink href="mailto:web@brennen.dev" label="Email">
                  <Mail className="h-4.5 w-4.5" />
                </MobileSocialLink>
                <MobileSocialLink
                  href="https://www.linkedin.com/in/brennenho/"
                  label="LinkedIn"
                >
                  <LinkedInIcon className="h-4.5 w-4.5" />
                </MobileSocialLink>
                <MobileSocialLink
                  href="https://github.com/brennenho"
                  label="GitHub"
                >
                  <GithubIcon className="h-4.5 w-4.5" />
                </MobileSocialLink>
                <MobileSocialLink href="https://x.com/brennenho_" label="X">
                  <XIcon className="h-4.5 w-4.5" />
                </MobileSocialLink>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function MobileSidebarGroup({
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

function MobileSidebarLink({
  active,
  item,
  onNavigate,
}: {
  active: boolean;
  item: NavItem;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex h-8 items-center gap-2 rounded-sm px-2 text-[#b8b8b5] transition-colors hover:bg-[#30302f]",
        active && "bg-[#373736] text-[#f1f1ef]",
      )}
    >
      <span className="w-5 text-[18px] leading-none">{item.icon}</span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function MobileSocialLink({
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
