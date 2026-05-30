import { ExperienceTable } from "@/components/notion/experience-table";
import { FontShuffleName } from "@/components/notion/font-shuffle-name";
import {
  NotionCallout,
  NotionList,
  PageContent,
  PageIcon,
  PageTitle,
  SectionTitle,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { PixelCanvas } from "@/components/pixel/pixel-canvas";
import { SpotifyMention } from "@/components/spotify/spotify-mention";
import { getEditedDateLabel } from "@/lib/git";

export default async function HomePage() {
  const editedDate = await getEditedDateLabel();

  return (
    <WorkspaceShell editedDate={editedDate} activePath="/">
      <main className="pb-24">
        <div className="relative">
          <PixelCanvas />
          <div className="pointer-events-none absolute bottom-[-38px] left-1/2 z-10 w-full max-w-[900px] -translate-x-1/2 px-8">
            <PageIcon>👋</PageIcon>
          </div>
        </div>

        <PageContent>
          <PageTitle>
            hey, i’m <FontShuffleName />
          </PageTitle>

          <NotionCallout>
            I create intuitive products that simplify, accelerate, and
            personalize — with an emphasis on applied AI.
          </NotionCallout>

          <SectionTitle>about</SectionTitle>
          <NotionList>
            <li>
              Studying Computer Engineering & Computer Science at the University
              of Southern California
              <ul className="mt-3 list-disc pl-6">
                <li>Minoring in Psychology</li>
              </ul>
            </li>
            <li>
              I’m fascinated in applied ai and product development, especially
              at the intersection of software and hardware
            </li>
            <li>
              On campus, I’m involved in the Code the Change (co-president),
              DILL Lab, LavaLab, TroyLabs, and Makers
            </li>
            <li>
              <SpotifyMention />
            </li>
          </NotionList>

          <SectionTitle>experience</SectionTitle>
          <ExperienceTable />
        </PageContent>
      </main>
    </WorkspaceShell>
  );
}
