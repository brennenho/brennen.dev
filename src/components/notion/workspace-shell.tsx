import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  ChevronRight,
  Edit3,
  Eye,
  Flower2,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  Sprout,
  Star,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type WorkspaceShellProps = {
  children: ReactNode;
  editedDate: string;
  activePath?: string;
};

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
  editedDate,
  activePath = "/",
}: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-[#191919] text-[#f1f1ef]">
      <WorkspaceSidebar activePath={activePath} />
      <div className="min-h-screen lg:pl-[244px]">
        <WorkspaceTopbar editedDate={editedDate} />
        {children}
      </div>
    </div>
  );
}

function WorkspaceTopbar({ editedDate }: { editedDate: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-[45px] items-center justify-between border-b border-transparent bg-[#191919]/95 px-3 text-[14px] text-[#b3b3b1] backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[18px] leading-none">👋</span>
        <span className="truncate font-medium text-[#efefed]">
          hey, i’m brennen
        </span>
        <Lock className="h-3.5 w-3.5 shrink-0 text-[#858582]" />
        <span className="hidden text-[#858582] sm:inline">Private</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-[#858582] sm:inline">
          Edited {editedDate}
        </span>
        <button className="font-medium text-[#efefed]">Share</button>
        <button aria-label="Favorite" className="text-[#d6d6d4]">
          <Star className="h-[18px] w-[18px]" />
        </button>
        <button aria-label="More actions" className="text-[#d6d6d4]">
          <MoreHorizontal className="h-[18px] w-[18px]" />
        </button>
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
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f1f1ef] text-[13px]">
            🐻‍❄️
          </div>
          <span className="truncate">brennen’s notion</span>
        </Link>
        <Edit3 className="h-4.5 w-4.5 text-[#eeeeec]" />
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
        "flex h-8 items-center gap-2 rounded-md px-2 text-[#b8b8b5] transition-colors hover:bg-[#30302f]",
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
    <main className="mx-auto flex min-h-[calc(100vh-50px)] max-w-[900px] flex-col px-8 pt-[18vh]">
      <div className="mb-5 text-[78px] leading-none">{icon}</div>
      <h1 className="mb-8 text-[40px] font-bold tracking-normal text-[#f1f1ef]">
        {title}
      </h1>
      <div className="flex max-w-xl items-start gap-3 rounded bg-[#2f3f35] px-4 py-3 text-[16px] leading-snug text-[#f1f1ef]">
        <Eye className="mt-0.5 h-5 w-5 shrink-0 text-[#cfcfcd]" />
        <p>{description} Coming soon.</p>
      </div>
    </main>
  );
}

export function PageIcon({ children }: { children: ReactNode }) {
  return <div className="text-[78px] leading-none">{children}</div>;
}

export function NotionCallout({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-md bg-[#1f432f] px-4 py-5 text-[16px] leading-[1.5] font-medium text-[#f4f4f2]">
      <span className="mt-0.5 text-[20px] leading-none">🎯</span>
      <div>{children}</div>
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-16 text-[26px] leading-tight font-bold text-[#f1f1ef]">
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
