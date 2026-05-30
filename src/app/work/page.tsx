import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedDateLabel } from "@/lib/git";

export default async function WorkPage() {
  const editedDate = await getEditedDateLabel();

  return (
    <WorkspaceShell editedDate={editedDate} activePath="/work">
      <ComingSoonPage icon="💼" title="work" />
    </WorkspaceShell>
  );
}
