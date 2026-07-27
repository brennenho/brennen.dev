import { getMusingSummaries } from "@/lib/musings";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

function toSitemapDate(value: string) {
  const [month, day, year] = value.split("-").map(Number);

  if (!month || !day || !year) return undefined;

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return date.toISOString().slice(0, 10);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const musings = await getMusingSummaries();

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...musings.map((musing) => ({
      url: `${SITE_URL}${musing.href}`,
      lastModified: toSitemapDate(musing.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
