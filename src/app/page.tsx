import { ExperienceTable } from "@/components/notion/experience-table";
import { FontShuffleName } from "@/components/notion/font-shuffle-name";
import { MacDock } from "@/components/notion/mac-dock";
import { NotionCallout } from "@/components/notion/notion-callout";
import {
  NotionList,
  NotionParagraph,
  PageContent,
  PageIcon,
  PageTitle,
  SectionSpacer,
  SectionTitle,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { PixelCanvas } from "@/components/pixel/pixel-canvas";
import { SpotifyMention } from "@/components/spotify/spotify-mention";
import { getPageEditedMetadata } from "@/lib/git";

export default async function HomePage() {
  const { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata("src/app/page.tsx");

  return (
    <WorkspaceShell
      editedCommitDate={commitDate}
      editedCommitTimestamp={commitTimestamp}
      editedCommitTitle={commitTitle}
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath="/"
    >
      <main className="pb-24">
        <div className="relative">
          <PixelCanvas className="h-[160px] sm:h-[195px] md:h-[250px]" />
          <div className="pointer-events-none absolute bottom-[-34px] left-1/2 z-10 w-full max-w-[900px] -translate-x-1/2 px-6 sm:px-8 md:bottom-[-38px]">
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

          <SectionSpacer />
          <SectionTitle>about</SectionTitle>
          <NotionList>
            <li>
              Studying Computer Engineering & Computer Science at the University
              of Southern California
              <ul className="mt-[10px] list-disc pl-6">
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

          <SectionSpacer />
          <SectionTitle>my dock</SectionTitle>
          <NotionParagraph>
            My favorites and daily drivers — a glimpse into life as a student
            and developer.
          </NotionParagraph>
          <MacDock />

          <SectionSpacer />
          <SectionTitle>experience</SectionTitle>
          <ExperienceTable />
        </PageContent>
      </main>
    </WorkspaceShell>
  );
}
