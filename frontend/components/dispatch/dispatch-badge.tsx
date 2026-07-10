"use client";

import { motion, useReducedMotion } from "framer-motion";

/** The "911 · CALL IN PROGRESS" status pill -- a pulsing dot plus label, styled
 * like dispatch/CAD terminal chrome. Reused wherever the chapter needs to
 * establish "a call is live" without any audio, synthesized voice, or words. */
export function DispatchBadge({ label = "911 · Call in progress", delay = 0 }: { label?: string; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.8, delay: prefersReducedMotion ? 0 : delay }}
      className="flex items-center gap-3 rounded-full border border-border/80 bg-surface/60 px-5 py-2.5 backdrop-blur-sm"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {!prefersReducedMotion && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-foreground/50"
            animate={{ scale: [1, 2.1], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-foreground" />
      </span>
      <span className="text-xs uppercase tracking-[0.25em] text-muted">{label}</span>
    </motion.div>
  );
}
