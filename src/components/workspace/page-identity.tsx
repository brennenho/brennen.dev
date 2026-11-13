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
      <span
        className={`text-[18px] leading-none ${localPageId ? "ph-no-capture" : ""}`}
      >
        {localPage?.emoji ?? icon}
      </span>
      <span
        className={`text-foreground min-w-0 truncate font-medium ${localPageId ? "ph-no-capture" : ""}`}
      >
        {localPage ? localPage.title || "Untitled" : title}
      </span>
    </>
  );
}
