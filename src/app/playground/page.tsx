import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedMetadata } from "@/lib/git";

export default async function PlaygroundPage() {
  const { dateLabel, commitUrl } = await getEditedMetadata();

  return (
    <WorkspaceShell
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/playground"
    >
      <ComingSoonPage icon="🛝" title="playground" />
    </WorkspaceShell>
  );
}
