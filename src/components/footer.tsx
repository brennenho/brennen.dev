import Link from "next/link";
import { Icons, SocialIcons } from "~/components";

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-6 border-t border-muted-foreground bg-muted p-8 pb-12">
      <SocialIcons className="h-5 w-5" />
      <div className="inline-flex items-center gap-3 text-sm">
        <div className="inline-flex items-center gap-1 font-medium">
          made with <Icons.heart className="h-4 w-4 fill-pink-300" /> in
          california
        </div>
        <div className="h-1 w-1 rounded-full bg-foreground" />
        <Link
          href="https://github.com/brennenho/brennen.dev"
          target="_blank"
          className="text-muted-foreground no-underline decoration-dashed decoration-1 underline-offset-[5px] hover:underline"
        >
          view source on github
        </Link>
      </div>
    </footer>
  );
}
