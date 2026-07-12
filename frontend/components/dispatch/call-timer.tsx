"use client";

import { useEffect, useState } from "react";

function formatElapsed(totalSeconds: number) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** A real, continuously-running call-duration counter -- purely cosmetic (not
 * tied to any actual event), but genuinely ticking rather than a static
 * placeholder, so it reads as "a call in progress" rather than a UI mockup.
 * `running=false` (used by continue-section.tsx, once the closing beat's call
 * "ends") stops the interval and holds whatever time it last showed, rather
 * than resetting -- the timer doesn't rewind, it just stops. */
export function CallTimer({ className, running = true }: { className?: string; running?: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <span className={`font-mono tabular-nums text-muted ${className ?? ""}`}>{formatElapsed(elapsed)}</span>
  );
}
