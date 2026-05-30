import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedMetadata } from "@/lib/git";

export default async function WatchlistPage() {
  const { dateLabel, commitUrl } = await getEditedMetadata();

  return (
    <WorkspaceShell
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/musings/watchlist"
    >
      <ComingSoonPage icon="👀" title="watchlist" />
    </WorkspaceShell>
  );
}
