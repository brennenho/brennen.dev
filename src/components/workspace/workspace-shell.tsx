import { getMusingSummaries } from "@/lib/musings";
import type { ReactNode } from "react";
import { EditedCommitLink } from "./edited-commit-link";
import { WorkspaceView } from "./workspace-view";

type WorkspaceShellProps = {
  children: ReactNode;
  editedCommitDate?: string;
  editedCommitTimestamp?: string;
  editedCommitTitle?: string;
  editedCommitUrl?: string;
  editedDate?: string;
  activePath?: string;
  localPageId?: string;
  pageIcon?: string;
  pageTitle?: string;
};

export async function WorkspaceShell({
  editedCommitDate = "",
  editedCommitTimestamp = "",
  editedCommitTitle = "",
  editedCommitUrl = "",
  editedDate = "",
  ...props
}: WorkspaceShellProps) {
  const musingItems = (await getMusingSummaries()).map(
    ({ href, emoji, label }) => ({
      href,
      icon: emoji,
      label,
    }),
  );
  return (
    <WorkspaceView
      {...props}
      musingItems={musingItems}
      edited={
        <EditedCommitLink
          commitDate={editedCommitDate}
          commitTitle={editedCommitTitle}
          commitUrl={editedCommitUrl}
          fallbackDateLabel={editedDate}
          fallbackTimestamp={editedCommitTimestamp}
        />
      }
    />
  );
}
