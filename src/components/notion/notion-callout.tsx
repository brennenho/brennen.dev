import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

const calloutColors = {
  blue: "bg-[#1d3446]",
  brown: "bg-[#493a2f]",
  gray: "bg-[#252525]",
  green: "bg-[#1f432f]",
  orange: "bg-[#5a351d]",
  pink: "bg-[#4a2938]",
  purple: "bg-[#3f2f50]",
  red: "bg-[#4a2929]",
  yellow: "bg-[#4a3f24]",
} as const;

const calloutInlineCodeStyle = {
  "--notion-inline-code-bg": "rgba(255, 255, 255, 0.11)",
  "--notion-inline-code-color": "#ff6472",
} as CSSProperties;

type NotionCalloutColor = keyof typeof calloutColors;

type NotionCalloutProps = {
  children: ReactNode;
  className?: string;
  color?: string;
  contentClassName?: string;
  icon?: ReactNode;
};

export function NotionCallout({
  children,
  className,
  color = "green",
  contentClassName,
  icon = "🎯",
}: NotionCalloutProps) {
  return (
    <div
      className={cn(
        "notion-callout flex items-start gap-3 rounded-md px-4 py-3.5 text-[16px] leading-[1.55] font-medium text-[#f4f4f2] sm:leading-[1.5]",
        getCalloutColorClassName(color),
        className,
      )}
      style={calloutInlineCodeStyle}
    >
      <span className="mt-0.5 text-[20px] leading-none">{icon}</span>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}

function getCalloutColorClassName(color: string) {
  return color in calloutColors
    ? calloutColors[color as NotionCalloutColor]
    : calloutColors.gray;
}
