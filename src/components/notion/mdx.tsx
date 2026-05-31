import { cn } from "@/lib/utils";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const bodyClassName = "text-[16px] leading-[1.55] font-medium text-[#f1f1ef]";

function NotionMdxCallout({
  children,
  icon = "💭",
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-[#252525] px-4 py-3.5 text-[16px] leading-[1.55] font-medium text-[#f1f1ef]">
      <span className="mt-0.5 text-[20px] leading-none">{icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function MdxAnchor({ children, href }: ComponentPropsWithoutRef<"a">) {
  if (!href) return <span>{children}</span>;

  const className =
    "text-[#529cca] underline decoration-[#529cca]/50 underline-offset-2 transition-colors hover:text-[#6fb3df]";

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

function MdxCode({ children, className }: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className={cn(
        "rounded bg-[#2f2f2e] px-1.5 py-0.5 font-mono text-[0.9em] text-[#eb5757]",
        className,
      )}
    >
      {children}
    </code>
  );
}

const components = {
  a: MdxAnchor,
  blockquote({ children }: ComponentPropsWithoutRef<"blockquote">) {
    return <NotionMdxCallout>{children}</NotionMdxCallout>;
  },
  code: MdxCode,
  h1({ children }: ComponentPropsWithoutRef<"h1">) {
    return (
      <h2 className="text-[30px] leading-tight font-bold text-[#f1f1ef]">
        {children}
      </h2>
    );
  },
  h2({ children }: ComponentPropsWithoutRef<"h2">) {
    return (
      <h2 className="pt-6 text-[24px] leading-tight font-bold text-[#f1f1ef] sm:text-[26px]">
        {children}
      </h2>
    );
  },
  h3({ children }: ComponentPropsWithoutRef<"h3">) {
    return (
      <h3 className="pt-3 text-[20px] leading-tight font-bold text-[#f1f1ef]">
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
    <div className="flex flex-col gap-[10px]">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
