"use client";

import { motion, useReducedMotion } from "framer-motion";

const RINGS = [0, 1, 2];

/**
 * The site's opening beat: a single point sending out a signal that keeps
 * repeating, literally the project's name and premise (one contact, then
 * another, then another) rather than a stand-in for a specific person or
 * event. The center dot grows in once on mount; the rings then loop
 * indefinitely as a quiet ambient motif behind the hero copy.
 */
export function SignalPulse({ size = 96 }: { size?: number }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center" aria-hidden>
        <span className="absolute h-8 w-8 rounded-full border border-foreground/25" />
        <span className="relative block h-3 w-3 rounded-full bg-foreground" />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center" aria-hidden>
      {RINGS.map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-foreground/40"
          style={{ width: size * 0.3, height: size * 0.3 }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.4, 1, 1] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5 + i * 0.85,
          }}
        />
      ))}
      <motion.span
        className="relative block h-3 w-3 rounded-full bg-foreground"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, type: "spring", bounce: 0.5 }}
      />
    </div>
  );
}
