import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Mail, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type SidebarItem = {
  href: string;
  icon: string;
  label: string;
};

export const favoriteItems: SidebarItem[] = [
  { href: "/", icon: "👋", label: "hey, i’m brennen" },
  { href: "/work", icon: "💼", label: "work" },
  { href: "/nursery", icon: "🌱", label: "nursery" },
  { href: "/playground", icon: "🛝", label: "playground" },
];

export function isFavoritePath(path: string) {
  return favoriteItems.some((item) => item.href === path);
}

export function NotionSidebar({
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
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[#2b2b2b] bg-[#202020] text-[#b8b8b5]",
        className,
      )}
    >
      <div className="flex h-[45px] items-center justify-between px-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-[14px] font-semibold text-[#f1f1ef]"
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
              item={item}
              onNavigate={onNavigate}
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
              onNavigate={onNavigate}
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
  item,
  onNavigate,
}: {
  active: boolean;
  item: SidebarItem;
  onNavigate?: () => void;
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
