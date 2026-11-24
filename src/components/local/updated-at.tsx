"use client";

import { useLocalPagesSaved } from "@/lib/local-pages";

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

export function UpdatedAt({ timestamp }: { timestamp: number }) {
  const saved = useLocalPagesSaved();

  return (
    <span
      className="text-muted-foreground rounded px-2 py-1"
      title={`Last edited ${dateTime.format(timestamp)}`}
    >
      {saved ? `Edited ${shortDate.format(timestamp)}` : "Not saved"}
    </span>
  );
}
