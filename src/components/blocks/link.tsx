import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type TextLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

const textLinkClassName =
  "text-foreground/85 underline decoration-muted-foreground decoration-1 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground/60";

export function TextLink({
  children,
  className,
  href,
  rel,
  target,
  ...props
}: TextLinkProps) {
  const resolvedClassName = cn(textLinkClassName, className);

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
