import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type NotionLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

const notionLinkClassName =
  "text-[#d4d4d1] underline decoration-[#858582] decoration-1 underline-offset-2 transition-colors hover:text-[#f1f1ef] hover:decoration-[#b8b8b5]";

export function NotionLink({
  children,
  className,
  href,
  rel,
  target,
  ...props
}: NotionLinkProps) {
  const resolvedClassName = cn(notionLinkClassName, className);

  if (isInternalHref(href)) {
    return (
      <Link className={resolvedClassName} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      className={resolvedClassName}
      href={href}
      rel={rel ?? "noreferrer"}
      target={target ?? "_blank"}
      {...props}
    >
      {children}
    </a>
  );
}

function isInternalHref(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}
