import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const FALLBACK_DATE = "2026-01-01T12:00:00.000Z";
const REPO_URL = "https://github.com/brennenho/brennen.dev";
const REPO_COMMITS_API_URL =
  "https://api.github.com/repos/brennenho/brennen.dev/commits";

type CommitMetadata = {
  date: string | null;
  sha: string | null;
  title: string | null;
  url: string | null;
};

const localSourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".json"];
const metadataFiles = new Set(["src/lib/git.ts"]);

function getVercelCommitDate() {
  return (
    process.env.VERCEL_GIT_COMMIT_DATE ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_DATE
  );
}

function getVercelCommitSha() {
  return process.env.VERCEL_GIT_COMMIT_SHA;
}

function normalizePaths(paths?: string | string[]) {
  if (!paths) return [];

  return (Array.isArray(paths) ? paths : [paths]).filter(Boolean);
}

function toRepoPath(filePath: string) {
  return path
    .relative(/* turbopackIgnore: true */ process.cwd(), filePath)
    .split(path.sep)
    .join("/");
}

function resolveLocalImport(fromPath: string, specifier: string) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return null;

  const basePath = specifier.startsWith("@/")
    ? path.join(
        /* turbopackIgnore: true */ process.cwd(),
        "src",
        specifier.slice(2),
      )
    : path.resolve(path.dirname(fromPath), specifier);
  const candidates = [
    basePath,
    ...localSourceExtensions.map((extension) => `${basePath}${extension}`),
    ...localSourceExtensions.map((extension) =>
      path.join(basePath, `index${extension}`),
    ),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function getLocalSpecifiers(source: string) {
  return Array.from(
    source.matchAll(
      /(?:import|export)\s+(?:[^'"]*?\s+from\s*)?["']([^"']+)["']/g,
    ),
    (match) => match[1],
  ).filter((specifier): specifier is string => Boolean(specifier));
}

function getApiRoutePath(route: string) {
  if (!route.startsWith("/api/")) return null;

  const routePath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "src/app",
    route.replace(/^\//, ""),
    "route.ts",
  );

  return existsSync(routePath) ? routePath : null;
}

function getReferencedApiRoutes(source: string) {
  return Array.from(
    source.matchAll(/["'](\/api\/[A-Za-z0-9/_-]+)["']/g),
    (match) => match[1],
  ).filter((route): route is string => Boolean(route));
}

function collectEditedPaths(entryPath: string) {
  const visited = new Set<string>();
  const paths = new Set<string>();

  function visit(filePath: string) {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(/* turbopackIgnore: true */ process.cwd(), filePath);
    const repoPath = toRepoPath(absolutePath);

    if (visited.has(absolutePath) || metadataFiles.has(repoPath)) return;
    if (!existsSync(absolutePath)) return;

    visited.add(absolutePath);
    paths.add(repoPath);

    const source = readFileSync(absolutePath, "utf8");

    for (const specifier of getLocalSpecifiers(source)) {
      const resolved = resolveLocalImport(absolutePath, specifier);
      if (resolved) visit(resolved);
    }

    for (const route of getReferencedApiRoutes(source)) {
      const routePath = getApiRoutePath(route);
      if (routePath) visit(routePath);
    }
  }

  visit(entryPath);

  return Array.from(paths);
}

function getLocalCommit(paths: string[]) {
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%H%x00%cI%x00%s", "--", ...paths],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    const [sha, date, title] = output.split("\0");
    if (!sha || !date || !title) return null;

    return {
      date,
      sha,
      title,
      url: sha ? `${REPO_URL}/commit/${sha}` : null,
    };
  } catch {
    return null;
  }
}

function getLocalRepoCommit() {
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%H%x00%cI%x00%s"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    const [sha, date, title] = output.split("\0");
    if (!sha || !date || !title) return null;

    return {
      date,
      sha,
      title,
      url: sha ? `${REPO_URL}/commit/${sha}` : null,
    };
  } catch {
    return null;
  }
}

async function getGitHubCommit(path?: string) {
  try {
    const url = new URL(REPO_COMMITS_API_URL);
    url.searchParams.set("per_page", "1");
    if (path) url.searchParams.set("path", path);

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) return null;

    const [commit] = (await response.json()) as Array<{
      html_url?: string;
      sha?: string;
      commit?: {
        message?: string;
        committer?: {
          date?: string;
        };
      };
    }>;

    if (!commit) return null;

    return {
      date: commit.commit?.committer?.date ?? null,
      sha: commit.sha ?? null,
      title: commit.commit?.message?.split("\n")[0] ?? null,
      url:
        commit.html_url ??
        (commit.sha ? `${REPO_URL}/commit/${commit.sha}` : null),
    };
  } catch {
    return null;
  }
}

async function getGitHubCommitForPaths(paths: string[]) {
  const commits = await Promise.all(paths.map((path) => getGitHubCommit(path)));

  return commits
    .filter((commit): commit is CommitMetadata => Boolean(commit?.date))
    .sort(
      (a, b) =>
        new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
    )[0];
}

function formatEditedDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Jan 22";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCommitTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Jan 22, 2026";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export async function getEditedMetadata(paths?: string | string[]) {
  const scopedPaths = normalizePaths(paths);
  const vercelSha = getVercelCommitSha();
  const vercelDate = getVercelCommitDate();
  const localCommit =
    scopedPaths.length > 0 ? getLocalCommit(scopedPaths) : getLocalRepoCommit();
  const githubCommit = localCommit
    ? null
    : scopedPaths.length > 0
      ? await getGitHubCommitForPaths(scopedPaths)
      : await getGitHubCommit();
  const fallbackCommit =
    vercelDate || vercelSha
      ? {
          date: vercelDate ?? FALLBACK_DATE,
          sha: vercelSha ?? null,
          title: "Latest deployment commit",
          url: vercelSha ? `${REPO_URL}/commit/${vercelSha}` : null,
        }
      : (getLocalRepoCommit() ?? {
          date: FALLBACK_DATE,
          sha: null,
          title: "Latest commit",
          url: null,
        });
  const commit = localCommit ?? githubCommit ?? fallbackCommit;

  return {
    commitDate: commit.date ?? FALLBACK_DATE,
    commitTimestamp: formatCommitTimestamp(commit.date ?? FALLBACK_DATE),
    commitTitle: commit.title ?? "Latest commit",
    dateLabel: formatEditedDateLabel(commit.date ?? FALLBACK_DATE),
    commitUrl: commit.url ?? `${REPO_URL}/commits/main`,
  };
}

export async function getPageEditedMetadata(pagePath: string) {
  return getEditedMetadata(collectEditedPaths(pagePath));
}

export async function getEditedDateLabel(paths?: string | string[]) {
  const { dateLabel } = await getEditedMetadata(paths);

  return dateLabel;
}
