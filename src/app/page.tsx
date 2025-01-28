import { About, Experience, Hero } from "~/components/home";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <div className="flex flex-col items-center gap-16 p-4 md:p-8">
        <About />
        <Experience />
      </div>
    </main>
  );
}
