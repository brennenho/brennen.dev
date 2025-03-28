"use client";

import posthog from "posthog-js";
import { cn } from "~/lib/utils";

interface ScrollArrowProps {
  targetId: string;
  className?: string;
  offsetHeight?: number;
}

export function ScrollArrow({
  targetId,
  className,
  offsetHeight = 0,
}: ScrollArrowProps) {
  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - offsetHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    posthog.capture("scroll_arrow");
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
