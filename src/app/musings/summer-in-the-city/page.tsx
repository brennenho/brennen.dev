import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedMetadata } from "@/lib/git";

export default async function SummerInTheCityPage() {
  const { dateLabel, commitUrl } = await getEditedMetadata();

  return (
    <WorkspaceShell
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/musings/summer-in-the-city"
    >
      <ComingSoonPage icon="🌉" title="summer in the city" />
    </WorkspaceShell>
  );
}
