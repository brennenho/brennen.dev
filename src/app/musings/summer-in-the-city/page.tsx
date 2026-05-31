import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getPageEditedMetadata } from "@/lib/git";

export default async function SummerInTheCityPage() {
  const { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/musings/summer-in-the-city/page.tsx");

  return (
    <WorkspaceShell
      editedCommitDate={commitDate}
      editedCommitTimestamp={commitTimestamp}
      editedCommitTitle={commitTitle}
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/musings/summer-in-the-city"
    >
      <ComingSoonPage icon="🌉" title="summer in the city" />
    </WorkspaceShell>
  );
}
