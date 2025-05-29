import { ScrollAnimation } from "@/components/scroll-animation";

export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <ScrollAnimation className="text-2xl leading-none font-bold">
      {children}
    </ScrollAnimation>
  );
}
