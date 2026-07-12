"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const BAR_COUNT = 40;
const BASE_HEIGHT = 5;
const MAX_HEIGHT = 32;

/** Deterministic PRNG (same technique as ui/signal-field.tsx) so bar heights
 * are stable across server/client renders -- Math.random() here would cause
 * a hydration mismatch. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type WaveformIntensity = "idle" | "speaking" | "quote" | "flatline";

/** Amplitude/speed multipliers keyed to what the transcript above is doing --
 * this is what makes the waveform react to the dialogue instead of just
 * looping obliviously in the background. "quote" (the one moment this
 * project has an actual verbatim recorded excerpt, see call-transcript.tsx)
 * gets the most pronounced motion; "idle" (before any line has appeared)
 * stays calm. Still no audio and no invented dialogue -- only the existing
 * decorative motif's own intensity now corresponds to real content beats.
 * "flatline" (continue-section.tsx, once the closing beat's call "ends") is
 * handled separately below -- a true still line, not just a low-amplitude
 * wobble, so the transition from "idle" reads as the signal actually
 * stopping rather than merely getting quieter. */
const INTENSITY: Record<Exclude<WaveformIntensity, "flatline">, { amp: number; speed: number }> = {
  idle: { amp: 0.45, speed: 1.5 },
  speaking: { amp: 1, speed: 1 },
  quote: { amp: 1.3, speed: 0.7 },
};

/** A live waveform, styled to read as "someone speaking into a headset" rather
 * than a uniform equalizer: each bar gets its own amplitude envelope (a few
 * random peaks/troughs, including the occasional near-silent dip for a
 * speech-like cadence) and its own loop duration, so the whole row never
 * settles into an obviously repeating, mechanical pattern. */
export function CallWaveform({ seed = 7, intensity = "idle" }: { seed?: number; intensity?: WaveformIntensity }) {
  const prefersReducedMotion = useReducedMotion();
  const isFlatline = intensity === "flatline";
  const { amp, speed } = isFlatline ? { amp: 0, speed: 1 } : INTENSITY[intensity];

  const bars = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const peaks = 3 + Math.floor(rand() * 2);
      const envelope = Array.from({ length: peaks }, () => {
        const isPause = rand() < 0.2;
        return isPause ? 0.15 : 0.35 + rand() * 0.65;
      });
      return {
        id: i,
        envelope,
        duration: 0.9 + rand() * 1.1,
        delay: rand() * 1.2,
      };
    });
  }, [seed]);

  return (
    <div className="flex h-8 items-end gap-[3px]" aria-hidden>
      {bars.map((bar) => (
        <motion.span
          key={bar.id}
          className="w-[3px] rounded-full bg-foreground/70"
          style={{ height: MAX_HEIGHT, transformOrigin: "bottom" }}
          initial={{ scaleY: BASE_HEIGHT / MAX_HEIGHT }}
          animate={
            prefersReducedMotion
              ? { scaleY: isFlatline ? BASE_HEIGHT / MAX_HEIGHT : 0.45 }
              : isFlatline
                ? { scaleY: BASE_HEIGHT / MAX_HEIGHT }
                : {
                    scaleY: [
                      BASE_HEIGHT / MAX_HEIGHT,
                      ...bar.envelope.map((v) => Math.min(1, v * amp)),
                      BASE_HEIGHT / MAX_HEIGHT,
                    ],
                  }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : isFlatline
                ? { duration: 0.8, ease: "easeOut" }
                : { duration: bar.duration * speed, delay: bar.delay, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
    </div>
  );
}
