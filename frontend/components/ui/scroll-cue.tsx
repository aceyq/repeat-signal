"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ScrollCue({ label = "Scroll" }: { label?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
      <span>{label}</span>
      <motion.div
        aria-hidden
        className="h-8 w-px bg-border"
        animate={prefersReducedMotion ? undefined : { scaleY: [0.3, 1, 0.3] }}
        style={{ transformOrigin: "top" }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
