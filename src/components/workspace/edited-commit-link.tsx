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

  return (
    <span className="group relative inline-block">
      <Link
        href={commitUrl}
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:bg-accent hover:text-foreground inline-block cursor-pointer rounded px-2 py-1 transition-colors"
        title={`${commitTitle} - ${displayDate.timestamp}`}
      >
        Edited {displayDate.dateLabel}
      </Link>
      <span className="absolute top-full right-0 z-50 hidden w-max max-w-[460px] pt-1.5 min-[900px]:group-focus-within:block min-[900px]:group-hover:block">
        <span className="border-border bg-popover text-muted-foreground block overflow-hidden rounded-lg border text-left shadow-md">
          <span className="border-border text-muted-foreground block border-b px-3 py-2 text-[13px] font-semibold">
            Last Edited
          </span>
          <Link
            href={commitUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:bg-accent flex max-w-[360px] items-start gap-4 px-3 py-2 text-[13px] transition-colors"
            title="View on GitHub"
          >
            <span className="text-popover-foreground max-w-[320px] min-w-[180px] font-semibold text-wrap">
              {commitTitle}
            </span>
            <span className="text-muted-foreground shrink-0 whitespace-nowrap">
              {displayDate.timestamp}
            </span>
          </Link>
        </span>
      </span>
    </span>
  );
}
