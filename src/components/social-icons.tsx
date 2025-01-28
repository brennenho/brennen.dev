import Link from "next/link";
import React from "react";
import { Icons } from "~/components";
import socials from "~/data/socials.json";
import { cn } from "~/lib/utils";

export interface SocialIcon {
  name: string;
  icon: React.ElementType;
  href: string;
}

const socialIcons: SocialIcon[] = socials.socials.map((icon) => ({
  ...icon,
  icon: Icons[icon.icon as keyof typeof Icons],
}));

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
