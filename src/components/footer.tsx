import Link from "next/link";
import { Icons, SocialIcons } from "~/components";

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center border-t bg-secondary py-2">
      <SocialIcons size="sm" />
      <div className="inline-flex items-center gap-3 pb-4 text-sm">
        <div className="inline-flex items-center gap-1 font-medium">
          made with <Icons.heart className="h-4 w-4 fill-pink-400" /> in
          california
        </div>
        <div className="h-1 w-1 rounded-full bg-foreground" />
        <Link
          href="https://github.com/brennenho/brennen.dev"
          target="_blank"
          className="text-muted-foreground no-underline decoration-1 underline-offset-[6px] transition-all duration-200 hover:underline"
        >
          view source on github
        </Link>
      </div>
    </footer>
  );
}
