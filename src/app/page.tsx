import PostIt from "$/img/post-it.png";
import Image from "next/image";
import Link from "next/link";
import { Hero, Icons, ScrollArrow } from "~/components/";
import { Button, Separator } from "~/components/ui";

export default function HomePage() {
  return (
    <main className="">
      <div className="flex h-full flex-col items-center pt-16">
        <Hero />
        <ScrollArrow targetId="scroll-target" className="mt-16 md:mt-56" />
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
          as a Presidental and Viterbi scholar.
        </div>
        <div className="mt-16 text-3xl font-bold">Projects</div>
        <Separator className="m-4 w-48" />
        <div className="flex flex-col items-center justify-center gap-8 p-16 pt-0 text-center md:flex-row md:text-left">
          <Image src={PostIt} alt="Post-It" className="h-72 w-72" />

          <div className="flex flex-col items-center justify-center md:items-start">
            <div className="text-lg">
              Data is the backbone of modern artificial intelligence.
              High-quality training datasets are essential for training accurate
              models and can be used to adapt existing foundational models to
              new domains. Post-It is a robust and extensible Python package and
              CLI designed to assist in data processing and filtration for AI
              workflows.
            </div>
            <Button variant="secondary" className="mt-4 w-40" asChild>
              <Link href="https://github.com/brennenho/post-it" target="_blank">
                <Icons.gitHub className="h-4 w-4" />
                view source
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
