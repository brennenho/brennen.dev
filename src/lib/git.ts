import { execSync } from "node:child_process";

const FALLBACK_DATE = "2026-01-22T12:00:00.000Z";
const REPO_URL = "https://github.com/brennenho/brennen.dev";
const REPO_COMMITS_URL =
  "https://api.github.com/repos/brennenho/brennen.dev/commits?per_page=1";

function getVercelCommitDate() {
  return (
    process.env.VERCEL_GIT_COMMIT_DATE ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_DATE
  );
}

function getVercelCommitSha() {
  return process.env.VERCEL_GIT_COMMIT_SHA;
}

function getLocalCommitDate() {
  try {
    return execSync("git log -1 --format=%cI", {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function getLocalCommitSha() {
  try {
    return execSync("git rev-parse HEAD", {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

async function getGitHubCommit() {
  try {
    const response = await fetch(REPO_COMMITS_URL, {
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
        committer?: {
          date?: string;
        };
      };
    }>;

    if (!commit) return null;

    return {
      date: commit.commit?.committer?.date ?? null,
      url:
        commit.html_url ??
        (commit.sha ? `${REPO_URL}/commit/${commit.sha}` : null),
    };
  } catch {
    return null;
  }
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

export async function getEditedMetadata() {
  const vercelSha = getVercelCommitSha();
  const localSha = getLocalCommitSha();
  const localDate = getLocalCommitDate();
  const vercelDate = getVercelCommitDate();
  const shouldFetchGitHub =
    !vercelDate && !localDate && !vercelSha && !localSha;
  const githubCommit = shouldFetchGitHub ? await getGitHubCommit() : null;
  const value = vercelDate ?? localDate ?? githubCommit?.date ?? FALLBACK_DATE;

  return {
    dateLabel: formatEditedDateLabel(value),
    commitUrl:
      (vercelSha ? `${REPO_URL}/commit/${vercelSha}` : null) ??
      (localSha ? `${REPO_URL}/commit/${localSha}` : null) ??
      githubCommit?.url ??
      `${REPO_URL}/commits/main`,
  };
}

export async function getEditedDateLabel() {
  const { dateLabel } = await getEditedMetadata();

  return dateLabel;
}
