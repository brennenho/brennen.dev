import {
  Callout,
  Comment,
  Discussion,
  InlineCode,
  List,
  Paragraph,
  SectionTitle,
  Spacer,
  SubsectionTitle,
  TextLink,
} from "@/components/blocks";
import { cn } from "@/lib/utils";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

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
    <Callout color={color} icon={icon}>
      {children}
    </Callout>
  );
}

function MdxAnchor({ children, href }: ComponentPropsWithoutRef<"a">) {
  if (!href) return <span>{children}</span>;

  return <TextLink href={href}>{children}</TextLink>;
}

const components = {
  a: MdxAnchor,
  blockquote({ children }: ComponentPropsWithoutRef<"blockquote">) {
    return <MdxCallout>{children}</MdxCallout>;
  },
  code: InlineCode,
  h1({ children }: ComponentPropsWithoutRef<"h1">) {
    return <SectionTitle>{children}</SectionTitle>;
  },
  h2({ children }: ComponentPropsWithoutRef<"h2">) {
    return <SectionTitle className="pt-7">{children}</SectionTitle>;
  },
  h3({ children }: ComponentPropsWithoutRef<"h3">) {
    return <SubsectionTitle className="pt-4">{children}</SubsectionTitle>;
  },
  hr() {
    return <Spacer />;
  },
  li({ children }: ComponentPropsWithoutRef<"li">) {
    return <li className="pl-1">{children}</li>;
  },
  ol({ children }: ComponentPropsWithoutRef<"ol">) {
    return <List ordered>{children}</List>;
  },
  p({ children }: ComponentPropsWithoutRef<"p">) {
    return <Paragraph>{children}</Paragraph>;
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
    return <List>{children}</List>;
  },
  Callout: MdxCallout,
  Comment,
  Discussion,
} satisfies MDXRemoteProps["components"];

export function MdxContent({ source }: { source: string }) {
  return (
    <div className={cn("flex flex-col", blockGapClassName)}>
      <MDXRemote
        source={source}
        components={components}
        options={{ blockJS: false }}
      />
    </div>
  );
}
