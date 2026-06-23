import {
  PageContent,
  PageIcon,
  PageTitle,
  SectionSpacer,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { cookies } from "next/headers";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/notion/leaderboard-table";
import { getPageEditedMetadata } from "@/lib/git";
import {
  GAME_PLAYER_COOKIE,
  hashPlayerToken,
  isValidPlayerToken,
} from "@/lib/games/player-token";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const GAME_KEY = "dino";
const LEADERBOARD_TABLE = "game_leaderboard_entries";
const REGION_DISPLAY_NAMES = new Intl.DisplayNames(["en"], {
  type: "region",
});

type GameLeaderboardEntry = {
  id: string;
  name: string;
  high_score: number;
  country: string | null;
  high_score_achieved_at: string;
  player_token_hash: string;
};

export default async function LeaderboardPage() {
  const { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/leaderboard/page.tsx");
  const leaderboardRows = await getLeaderboardRows();

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

        <SectionSpacer />
        <LeaderboardTable rows={leaderboardRows} />
      </PageContent>
    </WorkspaceShell>
  );
}

async function getLeaderboardRows(): Promise<LeaderboardRow[]> {
  const currentPlayerTokenHash = await getCurrentPlayerTokenHash();
  const { data, error } = await supabase
    .from(LEADERBOARD_TABLE)
    .select(
      "id, name, high_score, country, high_score_achieved_at, player_token_hash",
    )
    .eq("game_key", GAME_KEY)
    .order("high_score", { ascending: false })
    .order("high_score_achieved_at", { ascending: true })
    .limit(25)
    .overrideTypes<GameLeaderboardEntry[], { merge: false }>();

  if (error || !data) return [];

  return data.map((entry) => ({
    countryFlag: getCountryFlag(entry.country),
    id: entry.id,
    isCurrentPlayer: entry.player_token_hash === currentPlayerTokenHash,
    name: entry.name,
    score: entry.high_score,
    date: formatLeaderboardDate(entry.high_score_achieved_at),
    location: entry.country ?? "Unknown",
  }));
}

async function getCurrentPlayerTokenHash() {
  const token = (await cookies()).get(GAME_PLAYER_COOKIE)?.value;

  if (!isValidPlayerToken(token)) return null;

  return hashPlayerToken(token);
}

function getCountryFlag(country: string | null) {
  const countryCode = getCountryCode(country);

  if (!countryCode) return undefined;

  return countryCode
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
