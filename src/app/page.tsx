import { About, Experience, Hero, Projects } from "~/components/home";
import { AnimationWrapper } from "~/components/site";

export default function HomePage() {
  return (
    <main>
      <AnimationWrapper>
        <Hero />
      </AnimationWrapper>
      <div className="flex flex-col items-center gap-8 px-4 pb-8 md:gap-16 md:px-8 md:pb-16">
        <AnimationWrapper className="flex justify-center">
          <About />
        </AnimationWrapper>
        <AnimationWrapper className="flex justify-center">
          <Experience />
        </AnimationWrapper>
        <AnimationWrapper className="flex justify-center">
          <Projects />
        </AnimationWrapper>
      </div>
    </main>
  );
}
