"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once the given element has entered the viewport, and stays true --
 * the same "once: true" semantics as ui/reveal.tsx, but as a plain
 * IntersectionObserver rather than Framer Motion's `whileInView`. Deliberate:
 * these gate a D3 chart's own imperative draw effect, and mixing Framer's
 * view-tracking with D3's redraw cycle is exactly the kind of interaction
 * that caused Chapter 1's scroll-linked opacity bug (see frontend/README.md).
 * A plain observer, same reasoning as ui/animated-number.tsx, keeps this
 * simple enough to fully reason about.
 */
export function useInViewOnce<T extends Element>(ref: RefObject<T | null>) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, inView]);

  return inView;
}
