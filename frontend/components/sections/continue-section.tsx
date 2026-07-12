"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { DispatchBadge } from "@/components/dispatch/dispatch-badge";
import { CallWaveform } from "@/components/dispatch/call-waveform";
import { CallTimer } from "@/components/dispatch/call-timer";
import { useInViewOnce } from "@/hooks/use-in-view-once";

// Timing (ms from when this section first scrolls into view). Deliberately
// slower than Chapter 1's tightened cold-open pacing -- this is the one place
// on the site meant to feel unhurried rather than urgent.
const ENDING_AT = 2200;
const CLOSING_LINES = [
  { id: "c1", text: "The call ends.", at: 3000 },
  { id: "c2", text: "The timer stops. The line goes quiet.", at: 4400 },
  { id: "c3", text: "Somewhere after that, it became a timestamp. A coordinate. A case number.", at: 6000 },
  { id: "c4", text: "It was never only that.", at: 7800 },
  { id: "c5", text: "Neither is any of the others.", at: 9400 },
];

export function ContinueSection() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(containerRef);
  const [ended, setEnded] = useState(!!prefersReducedMotion);
  const [visibleCount, setVisibleCount] = useState(prefersReducedMotion ? CLOSING_LINES.length : 0);

  // A plain timed sequence once this section enters view -- not scroll-linked,
  // the same reasoning as every other post-Chapter-1 animation on this site.
  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    const endTimer = setTimeout(() => setEnded(true), ENDING_AT);
    const lineTimers = CLOSING_LINES.map((line, i) =>
      setTimeout(() => setVisibleCount((c) => Math.max(c, i + 1)), line.at),
    );
    return () => {
      clearTimeout(endTimer);
      lineTimers.forEach(clearTimeout);
    };
  }, [inView, prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center"
    >
      {/* The exact same dispatch console from Chapter 1's opening scene, reused
          rather than reinvented -- the site's own visual grammar for "a call is
          happening," now shown at the moment it stops. */}
      <div className="flex flex-col items-center gap-6">
        <DispatchBadge label={ended ? "911 · Call ended" : "911 · Call in progress"} pulsing={!ended} />
        <CallWaveform intensity={ended ? "flatline" : "idle"} />
        <CallTimer running={!ended} className="text-sm" />
      </div>

      <div className="mt-14 flex min-h-[14rem] flex-col items-center gap-4">
        {CLOSING_LINES.slice(0, visibleCount).map((line) => (
          <motion.p
            key={line.id}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.9, ease: "easeOut" }}
            className="max-w-xl text-lg leading-relaxed text-muted"
          >
            {line.text}
          </motion.p>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-16 border-t border-border pt-8">
        <p className="text-sm text-muted">
          Built end to end &mdash; data pipeline, backend, and this page &mdash; and documented at
          every step in the project&apos;s{" "}
          <a
            href="https://github.com/aceyq/repeat-signal"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-4 hover:text-accent"
          >
            GitHub repository
          </a>
          .
        </p>
      </Reveal>
    </section>
  );
}
