import { Bonsai } from "@/components/bonsai";
import { Heading } from "@/components/typography";

export default function TreePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 text-center">
      <Heading>Bonsai Tree</Heading>
      <Bonsai />
    </main>
  );
}
