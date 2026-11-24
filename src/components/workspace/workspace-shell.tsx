import { getMusingSummaries } from "@/lib/musings";
import type { ComponentProps } from "react";
import { WorkspaceView } from "./workspace-view";

export async function WorkspaceShell(
  props: Omit<ComponentProps<typeof WorkspaceView>, "musingItems">,
) {
  const musingItems = (await getMusingSummaries()).map(
    ({ href, emoji, label }) => ({
      href,
      icon: emoji,
      label,
    }),
  );
  return <WorkspaceView {...props} musingItems={musingItems} />;
}
