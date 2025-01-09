import { Hero } from "~/components/hero";
import { Section } from "~/components/section";

export default function HomePage() {
  return (
    <main className="">
      <div className="flex h-full flex-col items-center gap-4">
        <Hero />
        <Section title="About" />
      </div>
    </main>
  );
}
