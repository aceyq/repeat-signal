"use client";

import { useEffect, useState } from "react";

function formatElapsed(totalSeconds: number) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** A real, continuously-running call-duration counter -- purely cosmetic (not
 * tied to any actual event), but genuinely ticking rather than a static
 * placeholder, so it reads as "a call in progress" rather than a UI mockup. */
export function CallTimer({ className }: { className?: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`font-mono tabular-nums text-muted ${className ?? ""}`}>{formatElapsed(elapsed)}</span>
  );
}
