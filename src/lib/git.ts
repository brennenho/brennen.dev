import { execSync } from "node:child_process";

const FALLBACK_DATE = "2026-01-22T12:00:00.000Z";
const REPO_COMMITS_URL =
  "https://api.github.com/repos/brennenho/brennen.dev/commits?per_page=1";

function getVercelCommitDate() {
  return (
    process.env.VERCEL_GIT_COMMIT_DATE ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_DATE
  );
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

async function getGitHubCommitDate() {
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
      commit?: {
        committer?: {
          date?: string;
        };
      };
    }>;

    return commit?.commit?.committer?.date ?? null;
  } catch {
    return null;
  }
}

export async function getEditedDateLabel() {
  const value =
    getVercelCommitDate() ??
    getLocalCommitDate() ??
    (await getGitHubCommitDate()) ??
    FALLBACK_DATE;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Edited Jan 22";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}
