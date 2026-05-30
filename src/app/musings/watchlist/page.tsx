import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getPageEditedMetadata } from "@/lib/git";

export default async function WatchlistPage() {
  const { dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/musings/watchlist/page.tsx");

  return (
    <WorkspaceShell
      editedCommitTimestamp={commitTimestamp}
      editedCommitTitle={commitTitle}
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/musings/watchlist"
    >
      <ComingSoonPage icon="👀" title="watchlist" />
    </WorkspaceShell>
  );
}
