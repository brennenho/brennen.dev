export type SidebarItem = {
  href: string;
  icon: string;
  label: string;
};

export const favoriteItems: SidebarItem[] = [
  { href: "/", icon: "👋", label: "hey, i’m brennen" },
  { href: "/leaderboard", icon: "🏆", label: "leaderboard" },
];

export function isFavoritePath(path: string) {
  return favoriteItems.some((item) => item.href === path);
}
