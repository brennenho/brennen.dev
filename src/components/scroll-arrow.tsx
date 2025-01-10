"use client";

import { cn } from "~/lib/utils";

interface ScrollArrowProps {
  targetId: string;
  className?: string;
}

export function ScrollArrow({ targetId, className }: ScrollArrowProps) {
  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "mx-auto mt-8 flex h-12 w-12 cursor-pointer items-center justify-center",
        className,
      )}
    >
      <svg
        className="h-8 w-8 animate-bounce"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </div>
  );
}
