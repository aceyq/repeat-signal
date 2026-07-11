"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { PictogramGrid } from "@/components/ui/pictogram-grid";
import { CITY_ORDER } from "@/lib/map-config";
import type { CaseStudy } from "@/lib/case-studies";

function CaseTimeline({ events }: { events: { date: string; label: string }[] }) {
  return (
    <div className="mt-5">
      {events.map((event, i) => (
        <div key={event.date + i} className="relative flex gap-4 pb-5 last:pb-0">
          {i !== events.length - 1 && <span className="absolute left-[5.4rem] top-4 h-full w-px bg-border" />}
          <span className="w-20 shrink-0 text-right font-mono text-xs text-muted">{event.date}</span>
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full border border-border bg-background" />
          <p className="flex-1 text-sm leading-relaxed text-muted">{event.label}</p>
        </div>
      ))}
    </div>
  );
}

export function CaseStudyCard({ caseStudy, delay = 0 }: { caseStudy: CaseStudy; delay?: number }) {
  const meta = CITY_ORDER.find((c) => c.id === caseStudy.city)!;
  const prefersReducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  return (
    <Reveal delay={delay}>
      <article
        id={`case-study-${caseStudy.city}`}
        className="scroll-mt-24 overflow-hidden rounded-lg border border-border bg-surface"
        style={{ borderLeftColor: `var(${meta.accentVar})`, borderLeftWidth: 3 }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="w-full p-8 text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="text-sm font-medium uppercase tracking-[0.2em]"
                style={{ color: `var(${meta.accentVar})` }}
              >
                {caseStudy.cityLabel}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted/70">{caseStudy.recordType}</p>
            </div>
            <motion.span
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
              className="mt-1 shrink-0 text-2xl leading-none text-muted"
              aria-hidden
            >
              +
            </motion.span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-medium tracking-tight">{caseStudy.headline}</h3>
          {!expanded && <p className="mt-3 text-sm text-muted">Click to read the full case &rarr;</p>}
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-8 pb-8">
                <p className="leading-relaxed text-muted">{caseStudy.body}</p>

                {caseStudy.location && (
                  <p className="mt-4 text-xs uppercase tracking-[0.15em] text-muted/70">
                    Location: {caseStudy.location}
                  </p>
                )}

                {caseStudy.pictogram && (
                  <div className="mt-5">
                    <PictogramGrid
                      total={caseStudy.pictogram.total}
                      highlighted={caseStudy.pictogram.highlighted}
                      accentVar={meta.accentVar}
                      size={14}
                      label={caseStudy.pictogram.caption}
                    />
                    <p className="mt-2 text-xs text-muted">{caseStudy.pictogram.caption}</p>
                  </div>
                )}

                {caseStudy.timeline && <CaseTimeline events={caseStudy.timeline} />}

                {caseStudy.city === "sf" && (
                  <p className="mt-5 text-sm text-muted">
                    Full minute-by-minute timeline in{" "}
                    <a
                      href="#chapter-response"
                      className="underline decoration-border underline-offset-4 hover:text-accent-sf"
                    >
                      Chapter 02 &middot; The Response
                    </a>
                    .
                  </p>
                )}

                <a
                  href={caseStudy.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block text-sm underline decoration-border underline-offset-4 transition-colors hover:text-accent"
                >
                  Source: {caseStudy.sourceLabel} &rarr;
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </Reveal>
  );
}
