import { About, Hero } from "~/components/home";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <div className="flex flex-col items-center p-4">
        <About />
      </div>
    </main>
  );
}
