import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedDateLabel } from "@/lib/git";

export default async function WatchlistPage() {
  const editedDate = await getEditedDateLabel();

  return (
    <WorkspaceShell editedDate={editedDate} activePath="/musings/watchlist">
      <ComingSoonPage icon="👀" title="watchlist" />
    </WorkspaceShell>
  );
}
