import {
  Callout,
  InlineCode,
  PageContent,
  PageIcon,
  PageTitle,
  Spacer,
  TextLink,
} from "@/components/blocks";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/leaderboard";
import { WorkspaceShell } from "@/components/workspace";
import type { GameKey } from "@/lib/games/config";
import {
  GAME_PLAYER_COOKIE,
  hashPlayerToken,
  isValidPlayerToken,
} from "@/lib/games/player-token";
import { getPageEditedMetadata } from "@/lib/git";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  openGraph: {
    title: "leaderboard",
    url: "https://brennen.dev/leaderboard",
    siteName: "Brennen Ho",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "leaderboard",
  },
};

const GAME_KEY = "dino" satisfies GameKey;
const REGION_DISPLAY_NAMES = new Intl.DisplayNames(["en"], {
  type: "region",
});

type GameLeaderboardRow = {
  id: string;
  name: string;
  high_score: number;
  country_code: string | null;
  country_name: string | null;
  high_score_achieved_at: string;
  is_current_player: boolean;
};

type CurrentPlayerLeaderboardEntry = {
  id: string;
  name: string;
  high_score: number;
  high_score_achieved_at: string;
};

type CurrentPlayerLeaderboardStatus = {
  highScore: number;
  name: string;
  position: number | null;
};

export default async function LeaderboardPage() {
  const { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/leaderboard/page.tsx");
  const { currentPlayerStatus, leaderboardRows } =
    await getLeaderboardPageData();

  return (
    <WorkspaceShell
      editedCommitDate={commitDate}
      editedCommitTimestamp={commitTimestamp}
      editedCommitTitle={commitTitle}
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/leaderboard"
      pageIcon="🏆"
      pageTitle="leaderboard"
    >
      <PageContent>
        <PageIcon>🏆</PageIcon>
        <PageTitle>leaderboard</PageTitle>
        <CurrentPlayerStatusCallout status={currentPlayerStatus} />

        <Spacer />
        <LeaderboardTable rows={leaderboardRows} />
      </PageContent>
    </WorkspaceShell>
  );
}

async function getLeaderboardPageData() {
  const currentPlayerTokenHash = await getCurrentPlayerTokenHash();
  let supabase: ReturnType<typeof createAdminClient>;

  try {
    supabase = createAdminClient();
  } catch {
    return {
      currentPlayerStatus: null,
      leaderboardRows: [],
    };
  }

  const [leaderboardRows, currentPlayerStatus] = await Promise.all([
    getLeaderboardRows({ currentPlayerTokenHash, supabase }),
    getCurrentPlayerStatus({ currentPlayerTokenHash, supabase }),
  ]);

  return {
    currentPlayerStatus,
    leaderboardRows,
  };
}

async function getLeaderboardRows({
  currentPlayerTokenHash,
  supabase,
}: {
  currentPlayerTokenHash: string | null;
  supabase: ReturnType<typeof createAdminClient>;
}): Promise<LeaderboardRow[]> {
  const leaderboardResponse = (await supabase.rpc("get_game_leaderboard_rows", {
    p_game_key: GAME_KEY,
    p_limit: 25,
    p_player_token_hash: currentPlayerTokenHash,
  })) as unknown as {
    data: unknown;
    error: unknown;
  };

  if (leaderboardResponse.error || !leaderboardResponse.data) return [];

  return parseLeaderboardRows(leaderboardResponse.data).map((entry) => ({
    countryFlag: getCountryFlag(entry.country_code, entry.country_name),
    id: entry.id,
    isCurrentPlayer: entry.is_current_player,
    name: entry.name,
    score: entry.high_score,
    date: formatLeaderboardDate(entry.high_score_achieved_at),
    location: entry.country_name ?? "Unknown",
  }));
}

async function getCurrentPlayerStatus({
  currentPlayerTokenHash,
  supabase,
}: {
  currentPlayerTokenHash: string | null;
  supabase: ReturnType<typeof createAdminClient>;
}): Promise<CurrentPlayerLeaderboardStatus | null> {
  if (!currentPlayerTokenHash) return null;

  const { data: currentPlayerEntry, error: currentPlayerError } = await supabase
    .from("game_leaderboard_entries")
    .select("id, name, high_score, high_score_achieved_at")
    .eq("game_key", GAME_KEY)
    .eq("player_token_hash", currentPlayerTokenHash)
    .maybeSingle<CurrentPlayerLeaderboardEntry>();

  if (currentPlayerError || !currentPlayerEntry) return null;

  const [higherScoreResponse, earlierTieResponse] = await Promise.all([
    supabase
      .from("game_leaderboard_entries")
      .select("id", { count: "exact", head: true })
      .eq("game_key", GAME_KEY)
      .gt("high_score", currentPlayerEntry.high_score),
    supabase
      .from("game_leaderboard_entries")
      .select("id", { count: "exact", head: true })
      .eq("game_key", GAME_KEY)
      .eq("high_score", currentPlayerEntry.high_score)
      .lt("high_score_achieved_at", currentPlayerEntry.high_score_achieved_at),
  ]);

  const position =
    higherScoreResponse.error || earlierTieResponse.error
      ? null
      : (higherScoreResponse.count ?? 0) + (earlierTieResponse.count ?? 0) + 1;

  return {
    highScore: currentPlayerEntry.high_score,
    name: currentPlayerEntry.name,
    position,
  };
}

function CurrentPlayerStatusCallout({
  status,
}: {
  status: CurrentPlayerLeaderboardStatus | null;
}) {
  if (!status) {
    return (
      <Callout icon="🎮">
        You&apos;re unranked. Return <TextLink href="/">home</TextLink> and play
        a game to see your position on the leaderboard.
      </Callout>
    );
  }

  return (
    <Callout icon="🏁">
      You&apos;re playing as <InlineCode>{status.name}</InlineCode>. Your
      current position is{" "}
      <InlineCode>{formatLeaderboardPosition(status.position)}</InlineCode> with
      a high score of{" "}
      <InlineCode>{status.highScore.toLocaleString()}</InlineCode>.
    </Callout>
  );
}

function formatLeaderboardPosition(position: number | null) {
  return position ? `#${position.toLocaleString()}` : "unavailable";
}

function parseLeaderboardRows(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.filter(isGameLeaderboardRow);
}

function isGameLeaderboardRow(value: unknown): value is GameLeaderboardRow {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.high_score === "number" &&
    isNullableString(value.country_code) &&
    isNullableString(value.country_name) &&
    typeof value.high_score_achieved_at === "string" &&
    typeof value.is_current_player === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

async function getCurrentPlayerTokenHash() {
  const token = (await cookies()).get(GAME_PLAYER_COOKIE)?.value;

  if (!isValidPlayerToken(token)) return null;

  return hashPlayerToken(token);
}

function getCountryFlag(
  countryCode: string | null,
  countryName: string | null,
) {
  const resolvedCountryCode =
    countryCode?.trim().toUpperCase() ?? getCountryCode(countryName);

  if (!resolvedCountryCode || !/^[A-Z]{2}$/.test(resolvedCountryCode)) {
    return undefined;
  }

  return resolvedCountryCode
    .split("")
    .map((letter) => 127397 + letter.charCodeAt(0))
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join("");
}

function getCountryCode(country: string | null) {
  const normalizedCountry = country?.trim().toLowerCase();

  if (!normalizedCountry || normalizedCountry === "unknown") return null;

  if (/^[a-z]{2}$/i.test(normalizedCountry)) {
    return normalizedCountry.toUpperCase();
  }

  for (let first = 65; first <= 90; first++) {
    for (let second = 65; second <= 90; second++) {
      const countryCode = String.fromCharCode(first, second);
      const countryName = REGION_DISPLAY_NAMES.of(countryCode);

      if (countryName?.toLowerCase() === normalizedCountry) {
        return countryCode;
      }
    }
  }

  return null;
}

function formatLeaderboardDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}
