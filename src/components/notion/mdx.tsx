import { cn } from "@/lib/utils";
import { NotionInlineCode } from "@/components/notion/notion-inline-code";
import { NotionCallout } from "@/components/notion/notion-callout";
import { NotionLink } from "@/components/notion/notion-link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const bodyClassName = "text-[16px] leading-[1.62] font-medium text-[#f1f1ef]";
const blockGapClassName = "gap-[12px] sm:gap-[14px]";
function MdxCallout({
  children,
  color = "gray",
  icon = "💭",
}: {
  children: ReactNode;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <NotionCallout color={color} icon={icon}>
      {children}
    </NotionCallout>
  );
}

function MdxAnchor({ children, href }: ComponentPropsWithoutRef<"a">) {
  if (!href) return <span>{children}</span>;

  return <NotionLink href={href}>{children}</NotionLink>;
}

const components = {
  a: MdxAnchor,
  blockquote({ children }: ComponentPropsWithoutRef<"blockquote">) {
    return <MdxCallout>{children}</MdxCallout>;
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
  Callout: MdxCallout,
} satisfies MDXRemoteProps["components"];

export function NotionMdx({ source }: { source: string }) {
  return (
    <div className={cn("flex flex-col", blockGapClassName)}>
      <MDXRemote source={source} components={components} />
    </div>
  );
}
