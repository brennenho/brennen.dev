import { describe, expect, it } from "vitest";
import {
  LOCAL_PAGE_CREATED_EVENT,
  sanitizeLocalPageAnalytics,
  sanitizeLocalPageEvent,
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
    ).toEqual({ source: "recovery", $process_person_profile: false });
  });

  it("never includes private titles or persisted properties in creation events", () => {
    expect(
      sanitizeLocalPageAnalytics(LOCAL_PAGE_CREATED_EVENT, {
        token: "project-key",
        distinct_id: "visitor-id",
        source: "sidebar",
        $title: "Private draft",
        $initial_current_url: "https://brennen.dev/musings/a1b2c3d4",
        $set: { title: "Private draft" },
        content: "Private content",
      }),
    ).toEqual({
      token: "project-key",
      distinct_id: "visitor-id",
      source: "sidebar",
      $process_person_profile: false,
    });
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

  it("strips local initial URLs from nested and top-level person properties", () => {
    const initial = {
      $initial_current_url: "https://brennen.dev/musings/a1b2c3d4",
      $initial_pathname: "/musings/a1b2c3d4",
      $initial_referrer: "https://example.com/",
    };
    expect(
      sanitizeLocalPageEvent({
        event: "$pageview",
        properties: { $pathname: "/", $set_once: initial },
        $set_once: initial,
      }),
    ).toEqual({
      event: "$pageview",
      properties: {
        $pathname: "/",
        $set_once: { $initial_referrer: "https://example.com/" },
      },
      $set_once: { $initial_referrer: "https://example.com/" },
    });
  });

  it("omits person-property updates from aggregate creation events", () => {
    expect(
      sanitizeLocalPageEvent({
        event: LOCAL_PAGE_CREATED_EVENT,
        properties: { source: "sidebar", token: "project-key" },
        $set: { title: "Private draft" },
        $set_once: {
          $initial_current_url: "https://brennen.dev/musings/a1b2c3d4",
        },
      }),
    ).toEqual({
      event: LOCAL_PAGE_CREATED_EVENT,
      properties: {
        source: "sidebar",
        token: "project-key",
        $process_person_profile: false,
      },
    });
  });
});
