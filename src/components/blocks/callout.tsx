import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const calloutColors = {
  blue: "bg-[#e7f3f8] dark:bg-[#1d3446]",
  brown: "bg-[#f4eeee] dark:bg-[#493a2f]",
  gray: "bg-[#f1f1ef] dark:bg-[#252525]",
  green: "bg-[#edf3ec] dark:bg-[#1f432f]",
  orange: "bg-[#faebdd] dark:bg-[#5a351d]",
  pink: "bg-[#faf1f5] dark:bg-[#4a2938]",
  purple: "bg-[#f6f3f9] dark:bg-[#3f2f50]",
  red: "bg-[#fdebec] dark:bg-[#4a2929]",
  yellow: "bg-[#fbf3db] dark:bg-[#4a3f24]",
} as const;

type CalloutColor = keyof typeof calloutColors;

type CalloutProps = {
  children: ReactNode;
  className?: string;
  color?: string;
  contentClassName?: string;
  icon?: ReactNode;
};

export function Callout({
  children,
  className,
  color = "green",
  contentClassName,
  icon = "🎯",
}: CalloutProps) {
  return (
    <div
      className={cn(
        "block-callout flex items-start gap-3 rounded-md px-4 py-3.5 text-[16px] leading-[1.55] font-medium text-foreground sm:leading-normal",
        getCalloutColorClassName(color),
        className,
      )}
    >
      <span className="mt-0.5 text-[20px] leading-none">{icon}</span>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}

function getCalloutColorClassName(color: string) {
  return color in calloutColors
    ? calloutColors[color as CalloutColor]
    : calloutColors.gray;
}
