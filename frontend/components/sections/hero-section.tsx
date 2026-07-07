"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SignalField } from "@/components/ui/signal-field";
import { ScrollCue } from "@/components/ui/scroll-cue";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 80]);

  return (
    <section ref={ref} className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden px-6">
      <SignalField />
      <motion.div style={{ opacity, y }} className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-sm uppercase tracking-[0.3em] text-muted"
        >
          A data documentary
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-6 font-display text-6xl font-medium leading-[1.05] tracking-tight sm:text-8xl"
        >
          Repeat Signal
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mx-auto mt-8 max-w-xl text-balance text-lg text-muted sm:text-xl"
        >
          Some people contact police once. Others call again, and again, long before anything
          makes the news. This is what 1.65 million public incident reports across three cities
          can &mdash; and can&apos;t &mdash; tell us about those patterns.
        </motion.p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-10 z-10"
      >
        <ScrollCue label="Scroll to begin" />
      </motion.div>
    </section>
  );
}
