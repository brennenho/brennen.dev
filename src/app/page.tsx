import PostIt from "$/img/post-it.png";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "~/components/hero";
import { ScrollArrow } from "~/components/scroll-arrow";
import { Section } from "~/components/section";
import { Separator } from "~/components/ui/separator";

export default function HomePage() {
  return (
    <main className="">
      <div className="flex h-full flex-col items-center">
        <Hero />
        <ScrollArrow targetId="scroll-target" className="mt-16 md:mt-64" />
        <div id="scroll-target" className="mt-16 w-3/4 p-4 text-center text-lg">
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
          as a Presidental and Viterbi scholar .
        </div>
        <div className="mt-16 text-3xl font-bold">Projects</div>
        <Separator className="m-4 w-48" />
        <div className="container mx-auto my-16 grid grid-cols-1 gap-8 px-4 md:grid-cols-2 md:gap-32">
          <div className="flex flex-col items-center justify-center">
            <Section>
              <Image src={PostIt} alt="Post-It" className="h-48 w-48" />
            </Section>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-lg">
              Datasets form the backbone of modern machine learning. A
              high-quality dataset is vital to successfully train an AI model.
              To assist with this important task, I built a Python package and
              command line tool to efficiently curate datasets for AI
              pretraining.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
