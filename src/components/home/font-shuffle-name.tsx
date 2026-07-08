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
  { family: "American Typewriter, Courier New, Courier, monospace" },
  {
    family: "Avenir Next, Avenir, Helvetica Neue, Arial, sans-serif",
    weight: 700,
  },
  { family: "Gill Sans, Gill Sans MT, Calibri, sans-serif", weight: 700 },
  { family: "Trebuchet MS, Arial, sans-serif", style: "italic", weight: 700 },
  { family: "Optima, Candara, Segoe, sans-serif" },
  {
    family: "Didot, Bodoni 72, Bodoni MT, serif",
    style: "italic",
  },
  { family: "Palatino, Palatino Linotype, Book Antiqua, serif" },
  { family: "Arial Rounded MT Bold, Helvetica Rounded, Arial, sans-serif" },
  { family: "Georgia, Times, serif", style: "italic" },
] as const satisfies FontFrame[];

const FINAL_FRAME = frames.length - 1;

export function FontShuffleName() {
  const [index, setIndex] = useState(FINAL_FRAME);
  const [settled, setSettled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  function playAnimation() {
    if (reduceMotion) return;

    setSettled(false);
    setIndex(0);
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const id = window.requestAnimationFrame(() => {
      setReduceMotion(prefersReducedMotion);

      if (prefersReducedMotion) {
        setSettled(true);
        return;
      }

      setIndex(0);
    });

    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (reduceMotion || settled) return;

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
  }, [reduceMotion, settled]);

  const frame = frames[index] ?? frames[FINAL_FRAME]!;

  return (
    <span
      aria-label="brennen"
      onPointerEnter={playAnimation}
      className={cn(
        "relative inline-grid align-baseline text-primary",
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
