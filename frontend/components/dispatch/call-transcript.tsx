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
 * The opening scene's grounding beat: not invented dialogue. The quoted line
 * is the caller's own words, transcribed verbatim in San Francisco's DVDRT
 * Pilot Report (2023) from her third 911 call that night, October 9, 2014 --
 * a real excerpt, not a claim that the badge/waveform/timer above are a
 * recording of this specific call (those stay a generic "a call is
 * happening" motif, true of any of the ~1.65M incidents in this project).
 * Must stay word-for-word in sync with docs/CASE_STUDIES.md. See
 * frontend/README.md for the full context on why this replaced first an
 * invented version, then a paraphrased institutional finding.
 */
export const CALL_TRANSCRIPT: TranscriptLine[] = [
  { id: "l1", text: "This isn't hypothetical.", atSeconds: 1.2 },
  { id: "l2", text: "San Francisco, October 2014. She called 911 more than once that night.", atSeconds: 2.6 },
  {
    id: "l3",
    text: "I'm getting a little bit more, um, scared, because it's an escalating domestic violence situation.",
    atSeconds: 4.2,
    quote: true,
  },
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
    <div className="flex min-h-[10rem] flex-col justify-end gap-2">
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
          Her own words, from a 911 call that night &mdash; San Francisco DVDRT Pilot Report (2023) &mdash;{" "}
          <a href="#case-study-sf" className="underline decoration-muted/30 underline-offset-2 hover:text-muted">
            full case below
          </a>
        </motion.p>
      )}
    </div>
  );
}
