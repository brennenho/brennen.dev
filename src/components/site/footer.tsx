import Link from "next/link";
import { SocialIcons } from "~/components/site";

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-4 border-t border-muted-foreground bg-muted p-6 pb-8 md:gap-6 md:p-8 md:pb-12">
      <SocialIcons className="h-4 w-4 md:h-5 md:w-5" />
      <div className="inline-flex items-center gap-3 text-xs md:text-sm">
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
