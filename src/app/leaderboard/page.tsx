import {
  PageContent,
  PageIcon,
  PageTitle,
  SectionSpacer,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/notion/leaderboard-table";
import { getPageEditedMetadata } from "@/lib/git";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const GAME_KEY = "dino";
const LEADERBOARD_TABLE = "game_leaderboard_entries";

type GameLeaderboardEntry = {
  id: string;
  name: string;
  high_score: number;
  country: string | null;
  high_score_achieved_at: string;
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
  const { data, error } = await supabase
    .from(LEADERBOARD_TABLE)
    .select("id, name, high_score, country, high_score_achieved_at")
    .eq("game_key", GAME_KEY)
    .order("high_score", { ascending: false })
    .order("high_score_achieved_at", { ascending: true })
    .limit(25)
    .overrideTypes<GameLeaderboardEntry[], { merge: false }>();

  if (error || !data) return [];

  return data.map((entry) => ({
    id: entry.id,
    name: entry.name,
    score: entry.high_score,
    date: formatLeaderboardDate(entry.high_score_achieved_at),
    location: entry.country ?? "Unknown",
  }));
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
