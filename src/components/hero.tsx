import ProfilePic from "$/img/bho.jpg";
import Image from "next/image";
import { SocialIcons } from "~/components";

export function Hero() {
  return (
    <div className="mt-32 flex w-full max-w-4xl flex-col-reverse items-center px-6 md:mt-60 md:flex-row">
      <div className="flex-1 text-center md:mr-8 md:text-left">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          Hey, I'm <span className="text-primary">Brennen</span>
        </h1>
        <div className="mt-4 pb-8 text-xl">
          Impact-driven engineer excited about responsible AI.
        </div>
        <SocialIcons />
      </div>

      <div className="mb-8 md:mb-0">
        <Image
          src={ProfilePic}
          alt="Brennen Ho"
          className="h-32 w-32 rounded-full border-4 border-foreground md:h-48 md:w-48"
        />
      </div>
    </div>
  );
}
