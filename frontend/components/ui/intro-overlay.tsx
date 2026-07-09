"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const BEATS = ["One contact with police.", "Then another.", "Then a pattern begins."];
const BEAT_MS = 1400;

/**
 * The site's title-card moment, playing once on every fresh load: a signal
 * repeating, faster and wider each time, narrating the project's own premise
 * in three short beats before handing off to the hero underneath. Skippable
 * by click/tap/key at any point -- this is an entrance, not a gate.
 */
export function IntroOverlay() {
  const prefersReducedMotion = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (beat < BEATS.length - 1) {
      const t = setTimeout(() => setBeat((b) => b + 1), BEAT_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisible(false), BEAT_MS);
    return () => clearTimeout(t);
  }, [beat, prefersReducedMotion]);

  useEffect(() => {
    if (!visible) return;
    const skip = () => setVisible(false);
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [visible]);

  if (prefersReducedMotion) return null;

  return (
    <motion.button
      type="button"
      aria-label="Skip intro animation"
      onClick={() => setVisible(false)}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-hidden={!visible}
      className="fixed inset-0 z-[60] flex cursor-default flex-col items-center justify-center gap-8 bg-background text-center"
    >
      <div className="relative flex h-48 w-48 items-center justify-center" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={`${beat}-${i}`}
            className="absolute rounded-full border border-foreground/50"
            style={{ width: 56, height: 56 }}
            initial={{ opacity: 0.9, scale: 0.3 }}
            animate={{ opacity: 0, scale: 1.4 + beat * 0.9 }}
            transition={{ duration: 1.2, delay: i * 0.22, ease: "easeOut" }}
          />
        ))}
        <motion.span
          key={`dot-${beat}`}
          className="relative block h-4 w-4 rounded-full bg-foreground"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.45 }}
        />
      </div>
      <motion.p
        key={beat}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xs text-lg text-muted sm:text-xl"
      >
        {BEATS[beat]}
      </motion.p>
      <span className="absolute bottom-10 text-xs uppercase tracking-[0.3em] text-muted/50">
        Click, tap, or press any key to skip
      </span>
    </motion.button>
  );
}
