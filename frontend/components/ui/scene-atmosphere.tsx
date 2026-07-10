"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/** Layered vignette + cursor-following spotlight + film grain -- the cinematic
 * visual language for the dispatch chapter (and reusable by later ones).
 * The spotlight position is written straight to a CSS custom property on
 * pointermove rather than through React state, so tracking the cursor never
 * triggers a re-render (same reasoning as the D3 chart hover code elsewhere
 * in this codebase). Skipped under reduced motion -- the spotlight then just
 * sits at its default centered position instead of tracking the cursor. */
export function SceneAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--spot-x", `${x}%`);
      el.style.setProperty("--spot-y", `${y}%`);
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [prefersReducedMotion]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* The vignette + spotlight assume a dark backdrop (a dispatch center at
          night) -- in light mode, a black-edged vignette against the light
          theme's cream background reads as a muddy gray smear rather than
          cinematic depth, so both are dark-mode only. Grain stays in both. */}
      <div className="absolute inset-0 hidden dark:block cursor-spotlight" />
      <div className="absolute inset-0 hidden dark:block scene-vignette" />
      <div className="absolute inset-0 film-grain" />
    </div>
  );
}
