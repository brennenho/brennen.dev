"use client";

import { sanitizeLocalPageEvent } from "@/lib/local-page-analytics";
import { isLocalPagePath } from "@/lib/local-page-id";
import { SpeedInsights } from "@vercel/speed-insights/next";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: "history_change",
      // Session replays can buffer DOM snapshots across routes. Keep private
      // notes out of recordings while retaining public-page analytics.
      disable_session_recording: true,
      before_send: (event) => {
        if (!event) return null;
        return sanitizeLocalPageEvent(event);
      },
    });
  }, []);

  return (
    <>
      <PHProvider client={posthog}>{children}</PHProvider>
      <SpeedInsights
        beforeSend={(data) => {
          try {
            return isLocalPagePath(new URL(data.url).pathname) ? null : data;
          } catch {
            return data;
          }
        }}
      />
    </>
  );
}
