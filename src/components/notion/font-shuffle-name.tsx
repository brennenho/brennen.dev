"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type FontFrame = {
  family: string;
  style?: "italic" | "normal";
  weight?: number | string;
};

const frames: FontFrame[] = [
  {
    family: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  { family: "Georgia, Times, serif" },
  { family: "Arial Black, Arial, sans-serif", weight: 800 },
  { family: "Courier New, Courier, monospace" },
  { family: "Trebuchet MS, Arial, sans-serif" },
  { family: "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif" },
  {
    family: "Palatino, Palatino Linotype, Book Antiqua, serif",
    style: "italic",
  },
  { family: "Verdana, Geneva, sans-serif" },
  { family: "Times New Roman, Times, serif", style: "italic" },
  { family: "Georgia, Times, serif", style: "italic" },
] as const satisfies FontFrame[];

const FRAME_DURATION = 260;
const FINAL_FRAME = frames.length - 1;

export function FontShuffleName() {
  const [index, setIndex] = useState(FINAL_FRAME);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      setSettled(true);
      return;
    }

    setIndex(0);
    const id = window.setInterval(() => {
      setIndex((current) => {
        if (current >= FINAL_FRAME) {
          window.clearInterval(id);
          setSettled(true);
          return current;
        }

        return current + 1;
      });
    }, 105);

    return () => window.clearInterval(id);
  }, []);

  const frame = frames[index] ?? frames[FINAL_FRAME]!;

  return (
    <span
      aria-label="brennen"
      className={cn(
        "relative inline-grid align-baseline text-[#00a877]",
        settled && "font-serif italic",
      )}
    >
      <span aria-hidden="true" className="invisible font-serif italic">
        brennen
      </span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 whitespace-nowrap"
        style={{
          fontFamily: frame.family,
          fontStyle: frame.style ?? "normal",
          fontWeight: frame.weight ?? "inherit",
        }}
      >
        brennen
      </span>
    </span>
  );
}
