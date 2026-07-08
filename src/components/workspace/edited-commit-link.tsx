"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CommitDateParts = {
  dateLabel: string;
  timestamp: string;
};

type EditedCommitLinkProps = {
  commitDate: string;
  commitTitle: string;
  commitUrl: string;
  fallbackDateLabel: string;
  fallbackTimestamp: string;
  variant: "desktop" | "mobile";
};

function formatCommitDateParts(value: string, fallback: CommitDateParts) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return {
    dateLabel: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(date),
    timestamp: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

export function EditedCommitLink({
  commitDate,
  commitTitle,
  commitUrl,
  fallbackDateLabel,
  fallbackTimestamp,
  variant,
}: EditedCommitLinkProps) {
  const fallback = useMemo(
    () => ({
      dateLabel: fallbackDateLabel,
      timestamp: fallbackTimestamp,
    }),
    [fallbackDateLabel, fallbackTimestamp],
  );
  const [displayDate, setDisplayDate] = useState<CommitDateParts>(fallback);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setDisplayDate(formatCommitDateParts(commitDate, fallback));
    });

    return () => window.cancelAnimationFrame(id);
  }, [commitDate, fallback]);

  if (variant === "mobile") {
    return (
      <Link
        href={commitUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title={`${commitTitle} - ${displayDate.timestamp}`}
      >
        Edited {displayDate.dateLabel}
      </Link>
    );
  }

  return (
    <span className="group relative hidden sm:inline-block">
      <Link
        href={commitUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block cursor-pointer rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title="View on GitHub"
      >
        Edited {displayDate.dateLabel}
      </Link>
      <span className="absolute top-full right-0 z-50 hidden w-max max-w-[460px] pt-1.5 group-focus-within:block group-hover:block">
        <span className="block overflow-hidden rounded-lg border border-border bg-popover text-left text-muted-foreground shadow-md">
          <span className="block border-b border-border px-3 py-2 text-[13px] font-semibold text-muted-foreground">
            Last Edited
          </span>
          <Link
            href={commitUrl}
            target="_blank"
            rel="noreferrer"
            className="flex max-w-[360px] items-start gap-4 px-3 py-2 text-[13px] transition-colors hover:bg-accent"
            title="View on GitHub"
          >
            <span className="max-w-[320px] min-w-[180px] font-semibold text-wrap text-popover-foreground">
              {commitTitle}
            </span>
            <span className="shrink-0 whitespace-nowrap text-muted-foreground">
              {displayDate.timestamp}
            </span>
          </Link>
        </span>
      </span>
    </span>
  );
}
