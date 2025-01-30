"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import PostHogPageView from "./page-view";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: "/ingest",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
      });
    } else {
      console.debug("PostHog disabled in development");
    }
  }, []);

  // Only render PostHogPageView in production
  return (
    <PHProvider client={posthog}>
      {process.env.NODE_ENV === "production" && <PostHogPageView />}
      {children}
    </PHProvider>
  );
}
