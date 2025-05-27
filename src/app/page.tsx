import { Heading } from "@/components/typography";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex max-w-7xl flex-col gap-16 py-32">
        <div className="flex flex-col gap-2 leading-none">
          <div className="text-[40px] font-bold">
            Hey, I'm <span className="text-primary">Brennen</span>
          </div>
          <div>
            I create intuitive products that simplify, accelerate, and
            personalize — with an emphasis on applied AI.
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Heading>[about]</Heading>
          <div>
            I study Computer Engineering & Computer Science at the University of
            Southern California, where I&apos;m transforming online experiences
            through software, hardware, and a touch of design. <br />
            <br />
            This summer, I&apos;m working on language modeling at Bloomberg as
            an intern. I&apos;ve previously worked at Chipstack, innovating at
            the intersection of LLMs and semiconductors.
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Heading>[experience]</Heading>
        </div>
      </div>
    </main>
  );
}
