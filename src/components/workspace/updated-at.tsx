"use client";

import type { PageCommit } from "@/lib/git";
import Link from "next/link";
import { useSyncExternalStore } from "react";

function dateFormatters(timeZone?: string) {
  const date: Intl.DateTimeFormatOptions = {
    timeZone,
    month: "short",
    day: "numeric",
  };
  return {
    short: new Intl.DateTimeFormat("en", date),
    full: new Intl.DateTimeFormat("en", {
      ...date,
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

const utc = dateFormatters("UTC");
const local = dateFormatters();
const subscribe = () => () => undefined;

export function UpdatedAt(
  edit: PageCommit | { timestamp: number; saved: boolean },
) {
  // Use UTC through hydration, then show dates in the reader's time zone.
  const { short, full } = useSyncExternalStore(
    subscribe,
    () => local,
    () => utc,
  );
  const { timestamp } = edit;
  const fullDate = full.format(timestamp);
  const label = (
    <>
      Edited{" "}
      <time dateTime={new Date(timestamp).toISOString()}>
        {short.format(timestamp)}
      </time>
    </>
  );

  if ("saved" in edit) {
    return (
      <span
        className="text-muted-foreground rounded px-2 py-1"
        title={`Last edited ${fullDate}`}
      >
        {edit.saved ? label : "Not saved"}
      </span>
    );
  }

  return (
    <span className="group relative inline-block">
      <Link
        href={edit.url}
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:bg-accent hover:text-foreground inline-block cursor-pointer rounded px-2 py-1 transition-colors"
        title={`${edit.title} - ${fullDate}`}
      >
        {label}
      </Link>
      <span className="absolute top-full right-0 z-50 hidden w-max max-w-[460px] pt-1.5 min-[900px]:group-focus-within:block min-[900px]:group-hover:block">
        <span className="border-border bg-popover text-muted-foreground block overflow-hidden rounded-lg border text-left shadow-md">
          <span className="border-border text-muted-foreground block border-b px-3 py-2 text-[13px] font-semibold">
            Last Edited
          </span>
          <Link
            href={edit.url}
            target="_blank"
            rel="noreferrer"
            className="hover:bg-accent flex max-w-[360px] items-start gap-4 px-3 py-2 text-[13px] transition-colors"
            title="View on GitHub"
          >
            <span className="text-popover-foreground max-w-[320px] min-w-[180px] font-semibold text-wrap">
              {edit.title}
            </span>
            <span className="text-muted-foreground shrink-0 whitespace-nowrap">
              {fullDate}
            </span>
          </Link>
        </span>
      </span>
    </span>
  );
}
