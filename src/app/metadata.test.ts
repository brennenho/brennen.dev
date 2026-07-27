import { describe, expect, it } from "vitest";

import { getMusingSummaries } from "@/lib/musings";
import {
  PROFILE_JSON_LD,
  serializeJsonLd,
  SITE_URL,
  SOCIAL_PROFILE_URLS,
} from "@/lib/site";

import robots from "./robots";
import sitemap from "./sitemap";

describe("search metadata", () => {
  it("publishes the crawler policy and sitemap location", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/ingest/", "/link/"],
      },
      host: SITE_URL,
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });

  it("includes only the homepage and musings in the sitemap", async () => {
    const musings = await getMusingSummaries();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      SITE_URL,
      ...musings.map((musing) => `${SITE_URL}${musing.href}`),
    ]);
    expect(new Set(urls).size).toBe(urls.length);

    for (const url of urls) {
      const parsedUrl = new URL(url);

      expect(parsedUrl.protocol).toBe("https:");
      expect(parsedUrl.origin).toBe(SITE_URL);
      expect(
        ["/leaderboard", "/bonsai", "/api/", "/ingest/", "/link/"].some(
          (path) => parsedUrl.pathname.startsWith(path),
        ),
      ).toBe(false);
    }
  });

  it("converts musing frontmatter dates for the sitemap", async () => {
    const entries = await sitemap();
    const newBeginnings = entries.find(
      (entry) => entry.url === `${SITE_URL}/musings/new-beginnings`,
    );

    expect(newBeginnings?.lastModified).toBe("2026-07-08");
  });

  it("describes the homepage as Brennen's profile", () => {
    expect(PROFILE_JSON_LD["@type"]).toBe("ProfilePage");
    expect(PROFILE_JSON_LD.mainEntity["@type"]).toBe("Person");
    expect(PROFILE_JSON_LD.mainEntity.sameAs).toEqual(SOCIAL_PROFILE_URLS);
  });

  it("serializes JSON-LD without a literal opening tag", () => {
    const value = { value: "</script>" };
    const serialized = serializeJsonLd(value);
    const parsed: unknown = JSON.parse(serialized);

    expect(serialized).not.toContain("<");
    expect(parsed).toEqual(value);
  });
});
