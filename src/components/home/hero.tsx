import ProfilePic from "$/img/bho.jpg";
import Image from "next/image";
import { SocialIcons } from "~/components";
import { ScrollArrow } from "./scroll-arrow";

export function Hero() {
  return (
    <div className="relative flex h-screen w-full flex-col-reverse items-center justify-center gap-6 pt-16 md:flex-row md:justify-between md:px-[10vw]">
      <div className="flex -translate-y-20 flex-col gap-6 md:-translate-y-32">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-4xl font-bold md:text-5xl">
            Hey, I'm <span className="text-primary">Brennen</span>
          </h1>
          <div className="text-lg md:text-xl">
            Impact-driven engineer excited about responsible AI.
          </div>
        </div>
        <SocialIcons className="h-6 w-6 md:h-7 md:w-7" />
      </div>

      <div className="flex-shrink-0 -translate-y-20 md:-translate-y-32">
        <Image
          src={ProfilePic}
          alt="Brennen Ho"
          className="h-32 w-32 rounded-full border-4 border-foreground object-cover md:h-48 md:w-48"
        />
      </div>
      <ScrollArrow
        targetId="scroll-target"
        className="absolute bottom-32 left-1/2 -translate-x-1/2 md:bottom-16"
      />
    </div>
  );
}
