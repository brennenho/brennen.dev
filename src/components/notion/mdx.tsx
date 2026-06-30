import { cn } from "@/lib/utils";
import { NotionInlineCode } from "@/components/notion/notion-inline-code";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

const bodyClassName = "text-[16px] leading-[1.62] font-medium text-[#f1f1ef]";
const blockGapClassName = "gap-[12px] sm:gap-[14px]";
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

type CalloutColor = keyof typeof calloutColors;

const calloutInlineCodeStyle = {
  "--notion-inline-code-bg": "rgba(255, 255, 255, 0.11)",
  "--notion-inline-code-color": "#ff6472",
} as CSSProperties;

function NotionMdxCallout({
  children,
  color = "gray",
  icon = "💭",
}: {
  children: ReactNode;
  color?: string;
  icon?: ReactNode;
}) {
  const colorClassName =
    color in calloutColors
      ? calloutColors[color as CalloutColor]
      : calloutColors.gray;

  return (
    <div
      className={cn(
        "notion-callout flex items-start gap-3 rounded-md px-4 py-3.5 text-[16px] leading-[1.62] font-medium text-[#f1f1ef]",
        colorClassName,
      )}
      style={calloutInlineCodeStyle}
    >
      <span className="mt-0.5 text-[20px] leading-none">{icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function MdxAnchor({ children, href }: ComponentPropsWithoutRef<"a">) {
  if (!href) return <span>{children}</span>;

  const className =
    "text-[#d4d4d1] underline decoration-[#858582] decoration-1 underline-offset-2 transition-colors hover:text-[#f1f1ef] hover:decoration-[#b8b8b5]";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

const components = {
  a: MdxAnchor,
  blockquote({ children }: ComponentPropsWithoutRef<"blockquote">) {
    return <NotionMdxCallout>{children}</NotionMdxCallout>;
  },
  code: NotionInlineCode,
  h1({ children }: ComponentPropsWithoutRef<"h1">) {
    return (
      <h2 className="text-[30px] leading-tight font-bold text-[#f1f1ef]">
        {children}
      </h2>
    );
  },
  h2({ children }: ComponentPropsWithoutRef<"h2">) {
    return (
      <h2 className="pt-7 text-[24px] leading-tight font-bold text-[#f1f1ef] sm:text-[26px]">
        {children}
      </h2>
    );
  },
  h3({ children }: ComponentPropsWithoutRef<"h3">) {
    return (
      <h3 className="pt-4 text-[20px] leading-tight font-bold text-[#f1f1ef]">
        {children}
      </h3>
    );
  },
  hr() {
    return <div aria-hidden="true" className="h-6 shrink-0" />;
  },
  li({ children }: ComponentPropsWithoutRef<"li">) {
    return <li className="pl-1">{children}</li>;
  },
  ol({ children }: ComponentPropsWithoutRef<"ol">) {
    return (
      <ol className={cn("list-decimal space-y-[10px] pl-6", bodyClassName)}>
        {children}
      </ol>
    );
  },
  p({ children }: ComponentPropsWithoutRef<"p">) {
    return <p className={bodyClassName}>{children}</p>;
  },
  pre({ children }: ComponentPropsWithoutRef<"pre">) {
    return (
      <pre className="overflow-x-auto rounded-md bg-[#202020] p-4 font-mono text-[13px] leading-[1.5] text-[#f1f1ef]">
        {children}
      </pre>
    );
  },
  strong({ children }: ComponentPropsWithoutRef<"strong">) {
    return <strong className="font-bold text-[#f1f1ef]">{children}</strong>;
  },
  ul({ children }: ComponentPropsWithoutRef<"ul">) {
    return (
      <ul className={cn("list-disc space-y-[10px] pl-6", bodyClassName)}>
        {children}
      </ul>
    );
  },
  Callout: NotionMdxCallout,
} satisfies MDXRemoteProps["components"];

export function NotionMdx({ source }: { source: string }) {
  return (
    <div className={cn("flex flex-col", blockGapClassName)}>
      <MDXRemote source={source} components={components} />
    </div>
  );
}
