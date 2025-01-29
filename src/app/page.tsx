import { About, Experience, Hero, Projects } from "~/components/home";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <div className="flex flex-col items-center gap-8 px-4 pb-8 md:gap-16 md:px-8 md:pb-16">
        <About />
        <Experience />
        <Projects />
      </div>
    </main>
  );
}
