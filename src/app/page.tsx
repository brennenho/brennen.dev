import Link from "next/link";
import { Hero } from "~/components/hero";
import { ScrollArrow } from "~/components/scroll-arrow";

export default function HomePage() {
  return (
    <main className="">
      <div className="flex h-full flex-col items-center">
        <Hero />
        <ScrollArrow targetId="scroll-target" className="mt-48 md:mt-64" />
        <div id="scroll-target" className="mt-16 w-3/4 p-4 text-center text-lg">
          I'm a student and software engineer interested in applied AI and
          product development. I am currently studying Computer Engineering and
          Computer Science at the{" "}
          <Link
            target="_blank"
            href="https://usc.edu"
            className="underline decoration-1 underline-offset-[6px] transition-all duration-200 hover:decoration-2"
          >
            University of Southern California
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
