import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedDateLabel } from "@/lib/git";

export default async function NewBeginningsPage() {
  const editedDate = await getEditedDateLabel();

  return (
    <WorkspaceShell
      editedDate={editedDate}
      activePath="/musings/new-beginnings"
    >
      <ComingSoonPage icon="🌻" title="new beginnings" />
    </WorkspaceShell>
  );
}
