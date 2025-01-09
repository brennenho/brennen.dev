import Image from "next/image";
import SocialIcons from "~/components/social-icons";

export function Hero() {
  return (
    <div className="mt-20 flex w-full max-w-4xl flex-col-reverse items-center gap-4 px-6 md:mt-48 md:flex-row">
      <div className="flex-1 text-center md:mr-8 md:text-left">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          Hey, I'm <span className="text-primary">Brennen</span>
        </h1>
        <div className="mt-4 text-lg">
          Impact-driven engineer excited about responsible AI.
        </div>
        <SocialIcons />
      </div>

      <div className="mb-8 md:mb-0">
        <Image
          src="/img/bho.jpg"
          alt="Brennen Ho"
          width={150}
          height={150}
          className="rounded-full border-4 border-foreground md:h-48 md:w-48"
        />
      </div>
    </div>
  );
}
