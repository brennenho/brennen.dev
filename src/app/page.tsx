import {
  Callout,
  Comment,
  List,
  PageContent,
  PageIcon,
  PageTitle,
  Paragraph,
  SectionTitle,
  Spacer,
} from "@/components/blocks";
import { ExperienceTable, FontShuffleName, MacDock } from "@/components/home";
import { PixelCanvas } from "@/components/pixel";
import { SpotifyMention } from "@/components/spotify";
import { WorkspaceShell } from "@/components/workspace";
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

          <Callout>
            I create intuitive products that simplify, accelerate, and
            personalize — with an emphasis on applied AI.
          </Callout>

          <Spacer />
          <SectionTitle>about</SectionTitle>
          <List>
            <li>
              Studying Computer Engineering & Computer Science at the{" "}
              <Comment comment="w/ a psychology minor">
                University of Southern California
              </Comment>
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
          </List>

          <Spacer />
          <SectionTitle>my dock</SectionTitle>
          <Paragraph>
            My favorites and daily drivers — a glimpse into life as a student
            and developer.
          </Paragraph>
          <MacDock />

          <Spacer />
          <SectionTitle>experience</SectionTitle>
          <ExperienceTable />
        </PageContent>
      </main>
    </WorkspaceShell>
  );
}
