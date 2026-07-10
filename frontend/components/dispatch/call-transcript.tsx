"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface TranscriptLine {
  id: string;
  speaker: "Caller" | "Dispatcher";
  text: string;
  atSeconds: number;
}

/** Illustrative dispatch dialogue for the opening scene -- generic, not tied to
 * any real case or recording (see docs/ETHICS.md and frontend/README.md's note
 * on the opening "call" beat). Timed to appear a few seconds apart, like a
 * live dispatch log. */
export const CALL_TRANSCRIPT: TranscriptLine[] = [
  { id: "l1", speaker: "Caller", text: "I don't think he's breathing.", atSeconds: 4 },
  { id: "l2", speaker: "Dispatcher", text: "Stay on the line.", atSeconds: 7 },
  { id: "l3", speaker: "Dispatcher", text: "Units are being notified.", atSeconds: 10 },
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

  return (
    <div className="flex min-h-[7rem] flex-col justify-end gap-2">
      {lines.slice(0, visibleCount).map((line) => (
        <motion.p
          key={line.id}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.7, ease: "easeOut" }}
          className="text-base text-foreground sm:text-lg"
        >
          <span className="text-muted">{line.speaker}: </span>
          &ldquo;{line.text}&rdquo;
        </motion.p>
      ))}
      {visibleCount > 0 && (
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted/50">
          Reconstructed dialogue, for illustration &mdash; not an actual call
        </p>
      )}
    </div>
  );
}
