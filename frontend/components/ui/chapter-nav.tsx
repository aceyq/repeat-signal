"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const CHAPTERS = [
  { id: "chapter-1", number: "01", label: "The Call" },
  { id: "chapter-2", number: "02", label: "The Response" },
  { id: "chapter-3", number: "03", label: "The City" },
  { id: "chapter-4", number: "04", label: "The Data" },
  { id: "chapter-5", number: "05", label: "The Stories" },
  { id: "chapter-6", number: "06", label: "Explore" },
];

/**
 * Floating "case file" navigator, per the brief: appears once the reader has
 * scrolled past the opening beat, highlights whichever chapter is current,
 * and smoothly slides an indicator between them. Uses a plain
 * IntersectionObserver with a thin detection band near the top third of the
 * viewport (a standard "scrollspy" technique) rather than a scroll-linked
 * Framer Motion value -- this only needs to know which chapter is active,
 * never the exact scroll position, and Chapter 1's `useTransform` bug is
 * reason enough to keep this as simple as it can be. Hidden below `lg`: a
 * persistent floating side rail doesn't have room on narrow screens, and
 * every chapter is still reachable by scrolling normally.
 */
export function ChapterNav() {
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const topMost = intersecting.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveId(topMost.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.4 }}
          aria-label="Chapter navigation"
          className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted/60">Case file</p>
          <ul className="space-y-2 border-l border-border pl-4">
            {CHAPTERS.map((chapter) => {
              const isActive = activeId === chapter.id;
              return (
                <li key={chapter.id} className="relative">
                  {isActive && (
                    <motion.span
                      layoutId="chapter-nav-indicator"
                      className="absolute -left-4 top-0 h-full w-px bg-foreground"
                      transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
                    />
                  )}
                  <a
                    href={`#${chapter.id}`}
                    className="flex items-baseline gap-2 py-1 text-xs transition-colors hover:text-foreground"
                    style={{ color: isActive ? "var(--foreground)" : "var(--muted)" }}
                  >
                    <span className="font-mono">{chapter.number}</span>
                    <span className={isActive ? "font-medium" : ""}>{chapter.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
