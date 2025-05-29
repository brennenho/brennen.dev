import { HeartIcon } from "@/components/icons";
import { SocialIcons } from "@/components/social-icons";

export function Footer() {
  return (
    <footer className="flex w-full flex-row justify-center p-8">
      <div className="flex w-full max-w-7xl flex-row items-end justify-between gap-4">
        <SocialIcons />
        <div className="flex flex-col text-right leading-none">
          <div className="font-semibold">
            &copy; {new Date().getFullYear()} Brennen Ho
          </div>
          <div className="inline-flex items-center gap-1 text-sm">
            Made with
            <HeartIcon className="h-4 w-4 text-red-400" />
            in California
          </div>
        </div>
      </div>
    </footer>
  );
}
