import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedMetadata } from "@/lib/git";

export default async function SideQuestsPage() {
  const { dateLabel, commitUrl } = await getEditedMetadata();

  return (
    <WorkspaceShell
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/musings/side-quests"
    >
      <ComingSoonPage icon="🕵️" title="side quests" />
    </WorkspaceShell>
  );
}
