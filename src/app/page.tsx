import { CurrentlyPlaying } from "@/components/currently-playing";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects/map";
import { ScrollAnimation } from "@/components/scroll-animation";
import { Heading } from "@/components/typography";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-8 py-4">
      <div className="flex w-full max-w-7xl flex-col gap-16 pt-32 pb-8">
        <div className="flex flex-col gap-4 leading-none">
          <ScrollAnimation className="text-[40px] font-bold">
            Hey, I&apos;m <span className="text-primary">Brennen</span>
          </ScrollAnimation>
          <ScrollAnimation>
            I create intuitive products that simplify, accelerate, and
            personalize — with an emphasis on applied AI.
          </ScrollAnimation>
        </div>

        <div className="flex flex-col gap-4">
          <Heading>[about]</Heading>
          <div className="flex flex-col items-start gap-8 sm:flex-row">
            <ScrollAnimation>
              I study Computer Engineering & Computer Science at the University
              of Southern California, where I&apos;m transforming online
              experiences through software, hardware, and a touch of design.{" "}
              <br />
              <br />
              This summer, I&apos;ll be working on AI agents at Decagon.
              I&apos;v previously worked on language modeling at Bloomberg and
              LLMs for semiconductors at Chipstack.
            </ScrollAnimation>
            <CurrentlyPlaying />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Heading>[experience]</Heading>
          <Experience />
        </div>

        <div className="flex flex-col gap-4">
          <Heading>[projects]</Heading>
          <Projects />
        </div>
      </div>
    </main>
  );
}
