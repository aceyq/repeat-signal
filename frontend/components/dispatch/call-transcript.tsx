"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface TranscriptLine {
  id: string;
  text: string;
  atSeconds: number;
  /** Renders as an attributed quotation rather than plain framing text --
   * reserved for words actually taken from a cited source, never invented. */
  quote?: boolean;
}

/**
 * The opening scene's grounding beat: not invented dialogue. San Francisco's
 * DVDRT Pilot Report (2023) contains exactly one verbatim quote from the
 * actual call record -- everything else in the report is the reviewers' own
 * paraphrase, not exact words, so this can't honestly be built as a two-sided
 * exchange without inventing the other half. Instead this uses four real,
 * separately-sourced facts from the same report to build an actual arc
 * (how many times she called, her own words on one of those calls, how many
 * times police came, what happened anyway) rather than one quote floating
 * alone. Every non-quote line here is a fact stated directly in the report,
 * not a summary -- if you touch this, re-verify each one against the PDF
 * (see docs/CASE_STUDIES.md), not a search-engine summary of it. The badge/
 * waveform/timer above stay a generic "a call is happening" motif, true of
 * any of the ~1.65M incidents in this project, not a claim they're audio of
 * this specific call. See frontend/README.md for the full history of what
 * this replaced.
 */
export const CALL_TRANSCRIPT: TranscriptLine[] = [
  { id: "l1", text: "This isn't hypothetical.", atSeconds: 1.2 },
  { id: "l2", text: "San Francisco, October 2014. She called 911 six times that night.", atSeconds: 2.4 },
  {
    id: "l3",
    text: "I'm getting a little bit more, um, scared, because it's an escalating domestic violence situation.",
    atSeconds: 3.8,
    quote: true,
  },
  { id: "l4", text: "Police visited three times. It didn't stop what happened next.", atSeconds: 5.6 },
];

export function CallTranscript({ lines = CALL_TRANSCRIPT }: { lines?: TranscriptLine[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(prefersReducedMotion ? lines.length : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timers = lines.map((line, i) =>
      setTimeout(() => setVisibleCount((count) => Math.max(count, i + 1)), line.atSeconds * 1000),
    );
    return () => timers.forEach(clearTimeout);
  }, [lines, prefersReducedMotion]);

  const allVisible = visibleCount >= lines.length;

  return (
    <div className="flex min-h-[12rem] flex-col justify-end gap-2">
      {lines.slice(0, visibleCount).map((line) => (
        <motion.p
          key={line.id}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, ease: "easeOut" }}
          className={line.quote ? "text-xl text-foreground sm:text-2xl" : "text-base text-muted sm:text-lg"}
        >
          {line.quote ? <>&ldquo;{line.text}&rdquo;</> : line.text}
        </motion.p>
      ))}
      {allVisible && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.4 }}
          className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted/50"
        >
          A real case, San Francisco DVDRT Pilot Report (2023) &mdash;{" "}
          <a href="#case-study-sf" className="underline decoration-muted/30 underline-offset-2 hover:text-muted">
            full case below
          </a>
        </motion.p>
      )}
    </div>
  );
}
