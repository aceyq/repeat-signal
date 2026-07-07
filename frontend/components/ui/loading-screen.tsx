"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SignalField } from "./signal-field";

// Render's free tier spins the backend down after ~15 minutes idle; the first
// request after that can take 30-50s to wake it back up (see docs/ARCHITECTURE.md).
// Rather than show a blank screen or a stuck spinner for that whole window, cycle
// through a few honest, specific status lines so the wait reads as progress.
const MESSAGES = [
  "Waking up the data…",
  "The backend sleeps after periods of inactivity — free hosting has trade-offs.",
  "Connecting to Chicago, New York, and San Francisco’s public records…",
  "Almost there.",
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-6">
      <SignalField count={40} />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-accent"
              animate={prefersReducedMotion ? undefined : { opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </div>
        <p className="mt-6 max-w-sm text-balance text-muted" aria-live="polite">
          {MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}
