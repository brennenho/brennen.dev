import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getPageEditedMetadata } from "@/lib/git";

export default async function PlaygroundPage() {
  const { dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/playground/page.tsx");

  return (
    <WorkspaceShell
      editedCommitTimestamp={commitTimestamp}
      editedCommitTitle={commitTitle}
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/playground"
    >
      <ComingSoonPage icon="🛝" title="playground" />
    </WorkspaceShell>
  );
}
