import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedMetadata } from "@/lib/git";

export default async function NewBeginningsPage() {
  const { dateLabel, commitUrl } = await getEditedMetadata();

  return (
    <WorkspaceShell
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/musings/new-beginnings"
    >
      <ComingSoonPage icon="🌻" title="new beginnings" />
    </WorkspaceShell>
  );
}
