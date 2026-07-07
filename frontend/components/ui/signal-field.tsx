"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Ambient background: a deterministic scatter of small dots ("signals"), tinted
 * with the three cities' accent colors, plus soft glow blobs behind them. Pure
 * CSS/SVG -- no images -- so it's cheap and has no external asset dependency.
 * A fixed seed keeps the layout stable across server/client renders (avoids
 * hydration mismatches from Math.random()).
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACCENTS = ["var(--accent-chicago)", "var(--accent-nyc)", "var(--accent-sf)"];

export function SignalField({ count = 60, seed = 42 }: { count?: number; seed?: number }) {
  const prefersReducedMotion = useReducedMotion();
  const dots = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      r: 1 + rand() * 2.2,
      color: ACCENTS[Math.floor(rand() * ACCENTS.length)],
      delay: rand() * 6,
      duration: 4 + rand() * 4,
    }));
  }, [count, seed]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-accent-chicago/10 blur-3xl" />
      <div className="absolute right-[15%] top-[35%] h-80 w-80 rounded-full bg-accent-nyc/10 blur-3xl" />
      <div className="absolute bottom-[10%] left-[35%] h-72 w-72 rounded-full bg-accent-sf/10 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        {dots.map((dot) => (
          <circle
            key={dot.id}
            cx={`${dot.x}%`}
            cy={`${dot.y}%`}
            r={dot.r}
            fill={dot.color}
            opacity={0.45}
          >
            {!prefersReducedMotion && (
              <animate
                attributeName="opacity"
                values="0.15;0.55;0.15"
                dur={`${dot.duration}s`}
                begin={`${dot.delay}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </svg>
    </div>
  );
}
