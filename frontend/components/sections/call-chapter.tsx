"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useMotionValue, useMotionValueEvent } from "framer-motion";
import { DispatchBadge } from "@/components/dispatch/dispatch-badge";
import { CallWaveform } from "@/components/dispatch/call-waveform";
import { CallTimer } from "@/components/dispatch/call-timer";
import { CallTranscript, type TranscriptLine } from "@/components/dispatch/call-transcript";
import { SceneAtmosphere } from "@/components/ui/scene-atmosphere";
import { ScrollCue } from "@/components/ui/scroll-cue";

// Cold-open timeline (seconds from mount) -- plays once, independent of
// scroll. Named so the sequence reads as one deliberate beat, not decimals.
// Kept tight (badge through the real quote all land within ~5s) after user
// feedback that the original pacing left too long a stretch of "just a
// timer, no text" before anything grounded the scene.
const GLOW_FADE_START = 0.5;
const GLOW_FADE_DURATION = 0.9;
const BADGE_DELAY = 0.5;
const WAVEFORM_DELAY = 0.8;
const TIMER_DELAY = 0.9;

// Scroll-progress breakpoints across the chapter's pinned scroll height (see
// CHAPTER_HEIGHT_VH below). The dispatch console holds undisturbed through
// CONSOLE_HOLD_END, shrinks/fades through TRANSITION_END, then each large
// statement gets an equal fade-in/fade-out share of what's left.
const CONSOLE_HOLD_END = 0.16;
const TRANSITION_END = 0.32;
const STATEMENT_BREAKPOINTS = [0.52, 0.72, 1];
const CHAPTER_HEIGHT_VH = 450;

const STATEMENTS = [
  "Every emergency call begins with someone asking for help.",
  "Some calls receive help immediately. Others don't.",
  "Every second matters.",
];

/** Piecewise-linear interpolation with clamping at both ends -- the same
 * semantics as Framer Motion's `useTransform(value, input, output)`, but
 * computed eagerly inside a scroll event handler (see the `useMotionValueEvent`
 * below) instead of derived lazily through its own MotionValue subscription.
 * Driving these imperatively, the same way map-section.tsx derives its active
 * city index from scroll, sidesteps a reproducible issue where several
 * `useTransform`-derived values bound directly to `style` on this specific
 * tall pinned section (offset: ["start start", "end end"]) stopped updating
 * the painted DOM despite the underlying motion values themselves reading
 * correctly -- isolated via a bisected repro, but not worth blocking the
 * chapter on a deeper framer-motion investigation. */
function interpolate(value: number, inputRange: number[], outputRange: number[]) {
  if (value <= inputRange[0]) return outputRange[0];
  const lastIndex = inputRange.length - 1;
  if (value >= inputRange[lastIndex]) return outputRange[lastIndex];
  for (let i = 0; i < lastIndex; i++) {
    const start = inputRange[i];
    const end = inputRange[i + 1];
    if (value >= start && value <= end) {
      const t = end === start ? 0 : (value - start) / (end - start);
      return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
    }
  }
  return outputRange[lastIndex];
}

function StatementLayer({
  text,
  opacity,
}: {
  text: string;
  opacity: ReturnType<typeof useMotionValue<number>>;
}) {
  return (
    <motion.p
      style={{ opacity }}
      className="absolute inset-x-6 max-w-3xl text-balance text-center font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl"
    >
      {text}
    </motion.p>
  );
}

export function CallChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [blackoutLifted, setBlackoutLifted] = useState(!!prefersReducedMotion);
  const [activeLine, setActiveLine] = useState<TranscriptLine | undefined>(undefined);
  const waveformIntensity = !activeLine ? "idle" : activeLine.quote ? "quote" : "speaking";

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setTimeout(() => setBlackoutLifted(true), GLOW_FADE_START * 1000);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const consoleOpacity = useMotionValue(1);
  const consoleScale = useMotionValue(1);
  const consoleY = useMotionValue(0);
  const cueOpacity = useMotionValue(1);
  const statement1Opacity = useMotionValue(0);
  const statement2Opacity = useMotionValue(0);
  const statement3Opacity = useMotionValue(0);

  const statementRanges = STATEMENT_BREAKPOINTS.map((end, i) => ({
    start: i === 0 ? TRANSITION_END : STATEMENT_BREAKPOINTS[i - 1],
    end,
  }));

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    consoleOpacity.set(interpolate(progress, [CONSOLE_HOLD_END, TRANSITION_END], [1, 0]));
    consoleScale.set(interpolate(progress, [CONSOLE_HOLD_END, TRANSITION_END], [1, prefersReducedMotion ? 1 : 0.85]));
    consoleY.set(interpolate(progress, [CONSOLE_HOLD_END, TRANSITION_END], [0, prefersReducedMotion ? 0 : -32]));
    cueOpacity.set(interpolate(progress, [0, CONSOLE_HOLD_END * 0.8], [1, 0]));

    const statementValues = [statement1Opacity, statement2Opacity, statement3Opacity];
    statementRanges.forEach(({ start, end }, i) => {
      const isLast = i === statementRanges.length - 1;
      const mid = start + (end - start) * 0.3;
      const fadeOutStart = isLast ? end : end - (end - mid) * 0.35;
      const value = isLast
        ? interpolate(progress, [start, mid], [0, 1])
        : interpolate(progress, [start, mid, fadeOutStart, end], [0, 1, 1, 0]);
      statementValues[i].set(value);
    });
  });

  return (
    <section id="chapter-1" ref={sectionRef} className="relative" style={{ height: `${CHAPTER_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden bg-background">
        <SceneAtmosphere />

        {/* Cold open: page opens black, then a soft glow reveals the scene beneath. */}
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 0 : 1 }}
          animate={{ opacity: blackoutLifted ? 0 : 1 }}
          transition={{ duration: GLOW_FADE_DURATION, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 z-20 bg-black"
        />

        <motion.div
          style={{ opacity: consoleOpacity, scale: consoleScale, y: consoleY }}
          className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
        >
          <DispatchBadge delay={BADGE_DELAY} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.8, delay: prefersReducedMotion ? 0 : WAVEFORM_DELAY }}
          >
            <CallWaveform intensity={waveformIntensity} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.8, delay: prefersReducedMotion ? 0 : TIMER_DELAY }}
          >
            <CallTimer className="text-sm" />
          </motion.div>
          <div className="mt-2 w-full max-w-md">
            <CallTranscript onActiveLineChange={setActiveLine} />
          </div>
        </motion.div>

        <StatementLayer text={STATEMENTS[0]} opacity={statement1Opacity} />
        <StatementLayer text={STATEMENTS[1]} opacity={statement2Opacity} />
        <StatementLayer text={STATEMENTS[2]} opacity={statement3Opacity} />

        <motion.div style={{ opacity: cueOpacity }} className="pointer-events-none absolute bottom-10 z-10">
          <ScrollCue label="Scroll to begin" />
        </motion.div>
      </div>
    </section>
  );
}
