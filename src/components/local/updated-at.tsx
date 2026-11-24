"use client";

import { useLocalPage, useLocalPagesSaved } from "@/lib/local-pages";

const shortDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});
const dateTime = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function UpdatedAt({ id }: { id: string }) {
  const page = useLocalPage(id);
  const saved = useLocalPagesSaved();

  if (!page) return null;

  return (
    <span
      className="text-muted-foreground rounded px-2 py-1"
      title={`Last edited ${dateTime.format(page.updatedAt)}`}
    >
      {saved ? `Edited ${shortDate.format(page.updatedAt)}` : "Not saved"}
    </span>
  );
}
