"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { resolveCssColor } from "@/lib/color-utils";

function PersonIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <circle cx="12" cy="7" r="4" />
      <path d="M12 13c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5z" />
    </svg>
  );
}

/**
 * An isotype-style pictogram: `total` person icons, the first `highlighted` of which
 * light up (fade from muted to the given accent color) in sequence after the initial
 * reveal, so a stat like "about 1 in 5" is shown as a crowd with the affected fraction
 * visibly picked out, not just a number. Every count here should trace back to a real,
 * cited figure -- see the caller for sourcing, this component only draws what it's told.
 */
export function PictogramGrid({
  total,
  highlighted,
  accentVar = "--accent",
  size = 18,
  label,
}: {
  total: number;
  highlighted: number;
  accentVar?: string;
  size?: number;
  label: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [colors, setColors] = useState<{ muted: string; accent: string } | null>(null);

  // Unlike the mounted-gate pattern removed elsewhere in this codebase (see
  // theme-toggle.tsx), there's no SSR-safe alternative here: getComputedStyle needs
  // `document`, which doesn't exist during server rendering, so this must run in an
  // effect. The brief window before it resolves (a few ms) falls back to a neutral
  // color, not a visible flash, since these icons animate in on scroll anyway.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors({ muted: resolveCssColor("--border"), accent: resolveCssColor(accentVar) });
  }, [accentVar]);

  const icons = Array.from({ length: total }, (_, i) => i);
  const mutedColor = colors?.muted ?? "currentColor";
  const accentColor = colors?.accent ?? mutedColor;

  return (
    <div className="flex flex-wrap gap-1.5" role="img" aria-label={label}>
      {icons.map((i) => {
        const isHighlighted = i < highlighted;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7, color: mutedColor }}
            whileInView={{ opacity: 1, scale: 1, color: isHighlighted ? accentColor : mutedColor }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              opacity: { duration: prefersReducedMotion ? 0.01 : 0.3, delay: prefersReducedMotion ? 0 : i * 0.012 },
              scale: { duration: prefersReducedMotion ? 0.01 : 0.3, delay: prefersReducedMotion ? 0 : i * 0.012 },
              color: isHighlighted
                ? { duration: prefersReducedMotion ? 0.01 : 0.5, delay: prefersReducedMotion ? 0 : 0.6 + i * 0.04 }
                : { duration: 0 },
            }}
          >
            <PersonIcon size={size} />
          </motion.div>
        );
      })}
    </div>
  );
}
