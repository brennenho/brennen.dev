import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getPageEditedMetadata } from "@/lib/git";

export default async function NewBeginningsPage() {
  const { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/musings/new-beginnings/page.tsx");

  return (
    <WorkspaceShell
      editedCommitDate={commitDate}
      editedCommitTimestamp={commitTimestamp}
      editedCommitTitle={commitTitle}
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/musings/new-beginnings"
    >
      <ComingSoonPage icon="🌻" title="new beginnings" />
    </WorkspaceShell>
  );
}
