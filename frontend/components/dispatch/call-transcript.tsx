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
 * The opening scene's grounding beat: not invented dialogue, and not a claim
 * that this is a transcript of the call being visualized above (the badge/
 * waveform/timer are a generic "a call is happening" motif, true of any of
 * the ~1.65M incidents in this project, not a specific one). This is a real,
 * cited finding -- the quoted phrase must stay word-for-word in sync with
 * the SF entry in lib/case-studies.ts and docs/CASE_STUDIES.md, all drawn
 * from the same primary source. See frontend/README.md for the full context
 * on why this replaced an earlier illustrative/invented version.
 */
export const CALL_TRANSCRIPT: TranscriptLine[] = [
  { id: "l1", text: "This isn't hypothetical.", atSeconds: 4 },
  { id: "l2", text: "San Francisco, 2014 — reviewed by the city's Domestic Violence Death Review Team.", atSeconds: 7.5 },
  { id: "l3", text: "Multiple responses to the victim's address.", atSeconds: 11, quote: true },
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
    <div className="flex min-h-[8.5rem] flex-col justify-end gap-2">
      {lines.slice(0, visibleCount).map((line) => (
        <motion.p
          key={line.id}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.7, ease: "easeOut" }}
          className={line.quote ? "text-lg text-foreground sm:text-xl" : "text-base text-muted sm:text-lg"}
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
          San Francisco DVDRT Pilot Report (2023) &mdash;{" "}
          <a href="#case-study-sf" className="underline decoration-muted/30 underline-offset-2 hover:text-muted">
            full case below
          </a>
        </motion.p>
      )}
    </div>
  );
}
