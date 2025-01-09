import Image from "next/image";
import SocialIcons from "~/components/social-icons";

export function Hero() {
  return (
    <div className="mt-20 flex w-full max-w-4xl flex-col-reverse items-center gap-4 px-6 md:flex-row">
      <div className="flex-1 text-center md:mr-8 md:text-left">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          Hey, I'm <span className="text-primary">Brennen</span>
        </h1>
        <div className="mt-4 text-lg">
          Impact-driven engineer interested in responsible AI.
        </div>
        <SocialIcons />
      </div>

      <div className="md:mt-0">
        <Image
          src="/img/bho.jpg"
          alt="Brennen Ho"
          width={200}
          height={200}
          className="rounded-full border-4 border-foreground"
        />
      </div>
    </div>
  );
}
