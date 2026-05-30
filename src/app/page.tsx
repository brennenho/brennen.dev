import { ExperienceTable } from "@/components/notion/experience-table";
import { FontShuffleName } from "@/components/notion/font-shuffle-name";
import {
  NotionCallout,
  PageIcon,
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

        <article className="mx-auto max-w-[900px] px-8 pt-[112px]">
          <h1 className="mb-7 text-[44px] leading-[1.15] font-bold tracking-normal text-[#f1f1ef] sm:text-[48px]">
            hey, i’m <FontShuffleName />
          </h1>

          <NotionCallout>
            I create intuitive products that simplify, accelerate, and
            personalize — with an emphasis on applied AI.
          </NotionCallout>

          <SectionTitle>about</SectionTitle>
          <ul className="mt-5 list-disc space-y-3.5 pl-6 text-[17px] leading-[1.45] font-medium text-[#f1f1ef]">
            <li>
              Studying Computer Engineering & Computer Science at the University
              of Southern California
            </li>
            <li>
              I’m fascinated in applied ai and product development, especially
              at the intersection of software and hardware
            </li>
            <li>
              On campus, I’m involved in the DILL Lab, Code the Change, LavaLab,
              and Makers
            </li>
            <li>
              <span className="mr-2">I’m currently listening to:</span>
              <SpotifyMention />
            </li>
          </ul>

          <SectionTitle>experience</SectionTitle>
          <ExperienceTable />
        </article>
      </main>
    </WorkspaceShell>
  );
}
