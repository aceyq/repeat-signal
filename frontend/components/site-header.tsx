import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-tight">
          Repeat Signal
        </Link>
        <nav className="flex items-center gap-6">
          <span className="hidden text-sm text-muted sm:inline">
            Chicago &middot; New York &middot; San Francisco
          </span>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
