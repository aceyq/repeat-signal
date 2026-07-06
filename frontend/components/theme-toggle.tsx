"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // `resolvedTheme` is undefined during SSR and the first client render
  // (next-themes only knows the real preference after mount). Defaulting to
  // our layout's `defaultTheme="dark"` here keeps server and first-client-render
  // markup identical -- no hydration mismatch -- without needing a
  // mounted-gate effect, which briefly renders an empty placeholder instead.
  const isDark = resolvedTheme ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.742 13.045a8.088 8.088 0 0 1-2.077.273c-4.514 0-8.172-3.658-8.172-8.172 0-1.31.309-2.547.858-3.646a.75.75 0 0 0-.917-1.037A10.075 10.075 0 0 0 2 10.5C2 16.299 6.701 21 12.5 21a10.075 10.075 0 0 0 9.037-5.634.75.75 0 0 0-.795-1.32Z" />
        </svg>
      )}
    </button>
  );
}
