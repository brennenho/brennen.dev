"use client";

import { sanitizeLocalPageAnalytics } from "@/lib/local-page-analytics";
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
      before_send: (event) => {
        if (!event) return null;

        const properties = sanitizeLocalPageAnalytics(
          event.event,
          event.properties,
        );
        if (!properties) return null;

        return { ...event, properties };
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
