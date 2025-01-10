import Link from "next/link";
import React from "react";
import { Icons } from "~/components";
import { Button } from "~/components/ui";

interface SocialIcon {
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

export function SocialIcons() {
  return (
    <nav aria-label="social media links">
      <div className="flex flex-row justify-center gap-4 pt-8 md:justify-normal">
        {socialIcons.map((socialIcon) => (
          <Button key={socialIcon.name} variant="ghost" size="xl">
            <Link href={socialIcon.href} target="_blank" rel="noreferrer">
              <socialIcon.icon className="h-6 w-6" />
              <span className="sr-only">{socialIcon.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
