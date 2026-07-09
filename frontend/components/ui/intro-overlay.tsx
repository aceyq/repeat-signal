"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Beat = { type: "call" } | { type: "caption"; text: string };

const BEATS: Beat[] = [
  { type: "call" },
  { type: "caption", text: "One contact with police." },
  { type: "caption", text: "Then another." },
  { type: "caption", text: "Then a pattern begins." },
];

const BEAT_MS = (beat: Beat) => (beat.type === "call" ? 2200 : 1400);

const WAVEFORM_HEIGHTS = [6, 14, 22, 10, 28, 16, 24, 8, 18, 30, 12, 20, 26, 9, 16, 22, 11, 25, 14, 19];

/**
 * The opening "call" beat: an abstract voice-memo-style interface -- a
 * waveform, a ticking duration counter, a pulsing status dot -- standing in
 * for "a call is happening" without ever playing real or fabricated audio.
 * No words, no specific case, nothing that could pass as a real recording.
 */
function CallBeat() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-5" aria-hidden>
      <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-foreground/50"
            animate={{ scale: [1, 2], opacity: [0.6, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }}
          />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-foreground" />
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted">911 &middot; Call in progress</span>
      </div>
      <div className="flex h-10 items-end gap-[3px]">
        {WAVEFORM_HEIGHTS.map((h, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-foreground/70"
            style={{ height: h, transformOrigin: "bottom" }}
            animate={{ scaleY: [0.35, 1, 0.35] }}
            transition={{
              duration: 0.7 + (i % 5) * 0.12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-sm text-muted">
        {mm}:{ss}
      </span>
    </div>
  );
}

function PulseBeat({ growth }: { growth: number }) {
  return (
    <div className="relative flex h-48 w-48 items-center justify-center" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={`${growth}-${i}`}
          className="absolute rounded-full border border-foreground/50"
          style={{ width: 56, height: 56 }}
          initial={{ opacity: 0.9, scale: 0.3 }}
          animate={{ opacity: 0, scale: 1.4 + growth * 0.9 }}
          transition={{ duration: 1.2, delay: i * 0.22, ease: "easeOut" }}
        />
      ))}
      <motion.span
        key={`dot-${growth}`}
        className="relative block h-4 w-4 rounded-full bg-foreground"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 0.45 }}
      />
    </div>
  );
}

/**
 * The site's title-card moment, playing once on every fresh load: an abstract
 * "call" beat, then a signal repeating -- wider each time -- narrating the
 * project's own premise before handing off to the hero underneath. Skippable
 * by click/tap/key at any point -- this is an entrance, not a gate.
 */
export function IntroOverlay() {
  const prefersReducedMotion = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (beat < BEATS.length - 1) {
      const t = setTimeout(() => setBeat((b) => b + 1), BEAT_MS(BEATS[beat]));
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisible(false), BEAT_MS(BEATS[beat]));
    return () => clearTimeout(t);
  }, [beat, prefersReducedMotion]);

  useEffect(() => {
    if (!visible) return;
    const skip = () => setVisible(false);
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [visible]);

  if (prefersReducedMotion) return null;

  const current = BEATS[beat];

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
      {current.type === "call" ? <CallBeat /> : <PulseBeat growth={beat - 1} />}
      {current.type === "caption" && (
        <motion.p
          key={beat}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xs text-lg text-muted sm:text-xl"
        >
          {current.text}
        </motion.p>
      )}
      <span className="absolute bottom-10 text-xs uppercase tracking-[0.3em] text-muted/50">
        Click, tap, or press any key to skip
      </span>
    </motion.button>
  );
}
