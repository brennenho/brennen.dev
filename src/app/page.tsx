import { Hero } from "~/components/hero";

export default function HomePage() {
  return (
    <main className="">
      <div className="flex h-full flex-col items-center gap-4">
        <Hero />
      </div>
    </main>
  );
}
