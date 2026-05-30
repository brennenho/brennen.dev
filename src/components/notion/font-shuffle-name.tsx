"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const fonts = [
  "font-serif",
  "font-mono",
  "font-sans",
  "font-[cursive]",
  "font-[fantasy]",
  "font-serif",
];

export function FontShuffleName() {
  const [index, setIndex] = useState(fonts.length - 1);
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
        if (current >= fonts.length - 1) {
          window.clearInterval(id);
          setSettled(true);
          return current;
        }

        return current + 1;
      });
    }, 105);

    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className={cn(
        "inline-block text-[#00a877] transition-all duration-150",
        fonts[index],
        settled && "scale-100 font-serif italic",
      )}
    >
      brennen
    </span>
  );
}
