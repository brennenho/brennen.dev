import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const pageContentClassName = "mx-auto max-w-[900px] px-6 sm:px-8";

export function PageContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        pageContentClassName,
        "flex flex-col gap-[10px] pt-[80px] pb-24",
        className,
      )}
    >
      {children}
    </article>
  );
}
