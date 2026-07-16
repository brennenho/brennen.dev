import { describe, expect, it } from "vitest";
import {
  LOCAL_PAGE_CREATED_EVENT,
  sanitizeLocalPageAnalytics,
} from "./local-page-analytics";

describe("local page analytics", () => {
  it("drops automatic events originating on local pages", () => {
    expect(
      sanitizeLocalPageAnalytics("$pageview", {
        $current_url: "https://brennen.dev/musings/a1b2c3d4",
        $pathname: "/musings/a1b2c3d4",
      }),
    ).toBeNull();
  });

  it("keeps the aggregate creation event without its local path", () => {
    expect(
      sanitizeLocalPageAnalytics(LOCAL_PAGE_CREATED_EVENT, {
        $current_url: "https://brennen.dev/musings/a1b2c3d4",
        $pathname: "/musings/a1b2c3d4",
        source: "recovery",
      }),
    ).toEqual({ source: "recovery" });
  });

  it("removes a local-page referrer from a normal pageview", () => {
    expect(
      sanitizeLocalPageAnalytics("$pageview", {
        $current_url: "https://brennen.dev/",
        $pathname: "/",
        $prev_pageview_pathname: "/musings/a1b2c3d4",
      }),
    ).toEqual({
      $current_url: "https://brennen.dev/",
      $pathname: "/",
    });
  });
});
