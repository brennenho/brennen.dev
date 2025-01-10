import { cva, VariantProps } from "class-variance-authority";
import Link from "next/link";
import React from "react";
import { Icons } from "~/components";
import { Button } from "~/components/ui";
import { cn } from "~/lib/utils";

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

const socialIconVariants = cva("...", {
  variants: {
    size: {
      default: "h-6 w-6",
      sm: "h-5 w-5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type SocialIconsProps = VariantProps<typeof socialIconVariants>;

export function SocialIcons({ size }: SocialIconsProps) {
  return (
    <nav aria-label="social media links">
      <div className="flex flex-row justify-center gap-2 md:justify-normal">
        {socialIcons.map((socialIcon) => (
          <Button
            key={socialIcon.name}
            variant="ghost"
            size="xl"
            className="hover:bg-inherit hover:text-muted-foreground"
          >
            <Link href={socialIcon.href} target="_blank" rel="noreferrer">
              <socialIcon.icon className={cn(socialIconVariants({ size }))} />
              <span className="sr-only">{socialIcon.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
