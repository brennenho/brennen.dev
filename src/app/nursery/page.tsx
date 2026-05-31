import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getPageEditedMetadata } from "@/lib/git";

export default async function NurseryPage() {
  const { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/nursery/page.tsx");

  return (
    <WorkspaceShell
      editedCommitDate={commitDate}
      editedCommitTimestamp={commitTimestamp}
      editedCommitTitle={commitTitle}
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/nursery"
    >
      <ComingSoonPage icon="🌱" title="nursery" />
    </WorkspaceShell>
  );
}
