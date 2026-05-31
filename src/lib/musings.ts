import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { z } from "zod";

const musingsDirectory = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "src/content/musings",
);

const frontmatterSchema = z.object({
  date: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Use MM-DD-YYYY format."),
  emoji: z.string(),
  slug: z.string(),
  title: z.string(),
});

export type MusingFrontmatter = z.infer<typeof frontmatterSchema>;

export type MusingSummary = MusingFrontmatter & {
  filePath: string;
  href: string;
  label: string;
};

export type MusingPost = MusingSummary & {
  content: string;
  readTime: string;
};

function parseDate(value: string) {
  const [month, day, year] = value.split("-").map(Number);

  if (!month || !day || !year) {
    return new Date(Number.NaN);
  }

  return new Date(year, month - 1, day);
}

export function formatMusingDate(value: string) {
  const date = parseDate(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatMusingMonth(value: string) {
  const date = parseDate(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = new Intl.DateTimeFormat("en", { month: "short" })
    .format(date)
    .toLowerCase();
  const year = new Intl.DateTimeFormat("en", { year: "2-digit" }).format(date);

  return `${month} ’${year}`;
}

function calculateReadTime(content: string) {
  const plainText = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_~[\]()>{}.-]/g, " ");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 225));

  return `${minutes} min read`;
}

function parseMdxFrontmatter(source: string, filePath: string) {
  const frontmatterMatch = /^---\s*\n(?<frontmatter>[\s\S]*?)\n---\s*\n?/.exec(
    source,
  );

  if (!frontmatterMatch?.groups?.frontmatter) {
    throw new Error(`${filePath} is missing frontmatter.`);
  }

  const rawFrontmatter = Object.fromEntries(
    frontmatterMatch.groups.frontmatter
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(":");
        const key = line.slice(0, separatorIndex).trim();
        const value = line
          .slice(separatorIndex + 1)
          .trim()
          .replace(/^["']|["']$/g, "");

        return [key, value];
      }),
  );
  const frontmatter = frontmatterSchema.parse(rawFrontmatter);

  return {
    bodyStart: frontmatterMatch[0].length,
    frontmatter,
  };
}

function createMusingSummary(source: string, filePath: string): MusingSummary {
  const { frontmatter } = parseMdxFrontmatter(source, filePath);

  return {
    ...frontmatter,
    filePath,
    href: `/musings/${frontmatter.slug}`,
    label: `${frontmatter.title} - ${formatMusingMonth(frontmatter.date)}`,
  };
}

async function getMusingFilenames() {
  const { readdir } = await import("node:fs/promises");
  const filenames = await readdir(musingsDirectory);

  return filenames.filter((filename) => filename.endsWith(".mdx")).sort();
}

export const getMusingSummaries = cache(async () => {
  const filenames = await getMusingFilenames();
  const summaries = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(musingsDirectory, filename);
      const source = await readFile(filePath, "utf8");

      return createMusingSummary(source, filePath);
    }),
  );

  return summaries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
});

export async function getMusingPost(slug: string) {
  const summaries = await getMusingSummaries();
  const summary = summaries.find((post) => post.slug === slug);

  if (!summary) return null;

  const source = await readFile(summary.filePath, "utf8");
  const { bodyStart } = parseMdxFrontmatter(source, summary.filePath);
  const content = source.slice(bodyStart);

  return {
    ...summary,
    content,
    readTime: calculateReadTime(content),
  };
}
