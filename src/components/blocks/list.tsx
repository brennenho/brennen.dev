import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const bodyTextClassName =
  "text-[16px] leading-[1.5] font-medium text-[#f1f1ef]";

export function List({
  children,
  className,
  ordered = false,
}: {
  children: ReactNode;
  className?: string;
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={cn(
        ordered ? "list-decimal" : "list-disc",
        "space-y-[10px] pl-6",
        bodyTextClassName,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
