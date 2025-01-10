"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import posthog from "posthog-js";
import * as React from "react";
import { Button } from "~/components/ui";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    posthog.capture("theme_toggled", { theme: resolvedTheme });
  }, [resolvedTheme, setTheme]);

  return (
    <Button variant="ghost" className="group/toggle" onClick={toggleTheme}>
      <SunIcon className="hidden h-4 w-4 [html.dark_&]:block" />
      <MoonIcon className="hidden h-4 w-4 [html.light_&]:block" />
      <span className="sr-only">toggle theme</span>
    </Button>
  );
}
