import {
  ComingSoonPage,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getEditedDateLabel } from "@/lib/git";

export default async function SummerInTheCityPage() {
  const editedDate = await getEditedDateLabel();

  return (
    <WorkspaceShell
      editedDate={editedDate}
      activePath="/musings/summer-in-the-city"
    >
      <ComingSoonPage icon="🌉" title="summer in the city" />
    </WorkspaceShell>
  );
}
