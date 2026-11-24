"use client";

import { useLocalPage, useLocalPagesSaved } from "@/lib/local-pages";

export function LocalPageUpdatedAt({
  id,
  variant,
}: {
  id: string;
  variant: "desktop" | "mobile";
}) {
  const page = useLocalPage(id);
  const saved = useLocalPagesSaved();

  if (!page) return null;

  const date = new Date(page.updatedAt);
  const dateLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
  const timestamp = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return (
    <span
      className={
        variant === "mobile"
          ? "text-muted-foreground rounded px-2 py-1"
          : "text-muted-foreground hidden rounded px-2 py-1 sm:inline-block"
      }
      title={`Last edited ${timestamp}`}
    >
      {saved ? `Edited ${dateLabel}` : "Not saved"}
    </span>
  );
}
