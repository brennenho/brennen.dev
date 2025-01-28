import Link from "next/link";
import { Section } from "~/components";

export function About() {
  return (
    <div className="w-full md:w-3/4">
      <Section>
        <div id="scroll-target" className="text-center text-sm md:text-lg">
          I'm a student and software engineer interested in applied AI and
          product development. Currently studying{" "}
          <span className="font-semibold">
            Computer Engineering and Computer Science
          </span>{" "}
          at the{" "}
          <Link
            target="_blank"
            href="https://usc.edu"
            className="underline decoration-1 underline-offset-[6px] transition-all duration-200 hover:decoration-2"
          >
            University of Southern California
          </Link>{" "}
          as a Presidental and Viterbi scholar.
        </div>
      </Section>
    </div>
  );
}
