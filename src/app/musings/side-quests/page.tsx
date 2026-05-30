import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedDateLabel } from "@/lib/git";

export default async function SideQuestsPage() {
  const editedDate = await getEditedDateLabel();

  return (
    <WorkspaceShell editedDate={editedDate} activePath="/musings/side-quests">
      <ComingSoonPage icon="🕵️" title="side quests" />
    </WorkspaceShell>
  );
}
