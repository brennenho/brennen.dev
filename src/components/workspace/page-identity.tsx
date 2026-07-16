"use client";

import { useLocalPage } from "@/lib/local-pages";

export function PageIdentity({
  icon,
  localPageId,
  title,
}: {
  icon: string;
  localPageId?: string;
  title: string;
}) {
  const localPage = useLocalPage(localPageId ?? "");

  return (
    <>
      <span className="text-[18px] leading-none">
        {localPage?.emoji ?? icon}
      </span>
      <span className="text-foreground min-w-0 truncate font-medium">
        {localPage ? localPage.title || "Untitled" : title}
      </span>
    </>
  );
}
