import {
  PageContent,
  PageIcon,
  PageTitle,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getPageEditedMetadata } from "@/lib/git";

export default async function LeaderboardPage() {
  const { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/leaderboard/page.tsx");

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
      </PageContent>
    </WorkspaceShell>
  );
}
