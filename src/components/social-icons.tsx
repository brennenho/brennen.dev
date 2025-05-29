import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { Mail } from "lucide-react";
import Link from "next/link";

export function SocialIcons() {
  const socials = [
    {
      name: "Email",
      icon: <Mail className="h-6 w-6" />,
      href: "mailto:web@brennen.dev",
    },
    {
      name: "LinkedIn",
      icon: <LinkedInIcon className="h-6 w-6" />,
      href: "https://www.linkedin.com/in/brennenho/",
    },
    {
      name: "Github",
      icon: <GithubIcon className="h-6 w-6" />,
      href: "https://github.com/brennenho",
    },
    {
      name: "X",
      icon: <XIcon className="h-6 w-6" />,
      href: "https://x.com/brennenho_",
    },
  ];
  return (
    <nav aria-label="social media links">
      <div className="flex flex-row justify-center gap-3">
        {socials.map((social) => (
          <Link
            href={social.href}
            target="_blank"
            rel="noreferrer"
            key={social.href}
          >
            {social.icon}
            <span className="sr-only">{social.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
