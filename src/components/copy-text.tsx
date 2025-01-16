"use client";

import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { Icons } from "./icons";

interface CopyableTextProps {
  text: string;
  target: string;
  className?: string;
}

export function CopyText({ text, target, className }: CopyableTextProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(target);
      toast(
        <div className="flex flex-row items-center gap-4 pl-1">
          <Icons.copy className="h-4 w-4" />{" "}
          <div>{target} copied to clipboard.</div>
        </div>,
      );
    } catch {
      toast.error("Unable to copy to clipboard. Please try again later.");
    }
  };

  return (
    <div className={cn("cursor-pointer", className)} onClick={handleCopy}>
      {text}
    </div>
  );
}
