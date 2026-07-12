"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a chapter's opening eyebrow + heading only (Chapters 2-6 -- Chapter 1
 * already has its own bespoke cold-open sequence in call-chapter.tsx). Adds a
 * "coming into focus" entrance -- scale and blur settling alongside the
 * existing fade/translate on the Reveal children inside -- so crossing into a
 * new chapter reads as a deliberate cut, not just another paragraph fading
 * up. Still a plain `whileInView`, `once: true` trigger, same as Reveal --
 * never a scroll-linked value, per Chapter 1's useTransform bug.
 */
export function ChapterIntro({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.94, filter: prefersReducedMotion ? "blur(0px)" : "blur(6px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 1.1, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
