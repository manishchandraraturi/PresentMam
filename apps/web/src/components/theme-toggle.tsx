"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentTheme = theme || resolvedTheme || "dark";
  const isDark = currentTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      title={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1.5 text-xs font-medium text-text backdrop-blur-sm transition hover:bg-glass-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
    >
      {/* Icon */}
      <span className="flex h-4 w-4 items-center justify-center" aria-hidden="true">
        {!mounted ? (
          <span className="h-3.5 w-3.5 rounded-full bg-text-3/40" />
        ) : isDark ? (
          // Moon icon (representing dark theme)
          <svg
            className="h-3.5 w-3.5 text-fun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        ) : (
          // Sun icon (representing light theme)
          <svg
            className="h-3.5 w-3.5 text-action"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        )}
      </span>

      {/* Visible label */}
      <span className="font-sans">
        {!mounted ? "Theme" : isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
