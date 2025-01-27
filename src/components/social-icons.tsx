import Link from "next/link";
import React from "react";
import { Icons } from "~/components";
import { cn } from "~/lib/utils";

export interface SocialIcon {
  name: string;
  icon: React.ElementType;
  href: string;
}

const socialIcons: SocialIcon[] = [
  {
    name: "email",
    icon: Icons.email,
    href: "mailto:web@brennen.dev",
  },
  {
    name: "linkedIn",
    icon: Icons.linkedIn,
    href: "https://www.linkedin.com/in/brennenho/",
  },
  {
    name: "gitHub",
    icon: Icons.gitHub,
    href: "https://github.com/brennenho",
  },
];

interface SocialIconsProps {
  className: string;
}

export function SocialIcons({ className }: SocialIconsProps) {
  return (
    <nav aria-label="social media links">
      <div className="flex flex-row justify-center gap-8 md:justify-normal">
        {socialIcons.map((socialIcon) => (
          <Link
            href={socialIcon.href}
            target="_blank"
            rel="noreferrer"
            key={socialIcon.href}
          >
            <socialIcon.icon
              className={cn("hover:text-muted-foreground", className)}
            />
            <span className="sr-only">{socialIcon.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
