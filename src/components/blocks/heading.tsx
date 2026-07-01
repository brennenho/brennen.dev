import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const pageTitleClassName =
  "text-[42px] leading-[1.12] font-bold tracking-normal text-[#f1f1ef] sm:text-[48px]";

export function PageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1 className={cn(pageTitleClassName, "mb-[10px]", className)}>
      {children}
    </h1>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-[24px] leading-tight font-bold text-[#f1f1ef] sm:text-[26px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SubsectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-[20px] leading-tight font-bold text-[#f1f1ef]",
        className,
      )}
    >
      {children}
    </h3>
  );
}
