import { getMusingSummaries } from "@/lib/musings";
import { WorkspaceView, type WorkspacePageProps } from "./workspace-view";

export async function WorkspaceShell(props: WorkspacePageProps) {
  const musingItems = (await getMusingSummaries()).map(
    ({ href, emoji, label }) => ({
      href,
      icon: emoji,
      label,
    }),
  );

  return <WorkspaceView {...props} musingItems={musingItems} />;
}
