"use client";

import { useLocalPage, useLocalPagesReady } from "@/lib/local-pages";
import { MISSING_MUSING_ICON, MISSING_MUSING_TITLE } from "@/lib/site";

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
  const ready = useLocalPagesReady();
  const missing = localPageId && ready && !localPage;
  const pageIcon = missing ? MISSING_MUSING_ICON : (localPage?.emoji ?? icon);
  const { title: localTitle = "" } = localPage ?? {};

  return (
    <>
      {pageIcon && (
        <span
          className={`text-[18px] leading-none ${localPageId ? "ph-no-capture" : ""}`}
        >
          {pageIcon}
        </span>
      )}
      <span
        className={`text-foreground min-w-0 truncate font-medium ${localPageId ? "ph-no-capture" : ""}`}
      >
        {missing ? MISSING_MUSING_TITLE : localTitle || title}
      </span>
    </>
  );
}
