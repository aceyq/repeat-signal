import { Reveal } from "@/components/ui/reveal";
import { PictogramGrid } from "@/components/ui/pictogram-grid";
import { CITY_ORDER } from "@/lib/map-config";
import type { CaseStudy } from "@/lib/case-studies";

export function CaseStudyCard({ caseStudy, delay = 0 }: { caseStudy: CaseStudy; delay?: number }) {
  const meta = CITY_ORDER.find((c) => c.id === caseStudy.city)!;

  return (
    <Reveal delay={delay}>
      <article
        id={`case-study-${caseStudy.city}`}
        className="scroll-mt-24 rounded-lg border border-border bg-surface p-8"
        style={{ borderLeftColor: `var(${meta.accentVar})`, borderLeftWidth: 3 }}
      >
        <p
          className="text-sm font-medium uppercase tracking-[0.2em]"
          style={{ color: `var(${meta.accentVar})` }}
        >
          {caseStudy.cityLabel}
        </p>
        <h3 className="mt-3 font-display text-2xl font-medium tracking-tight">{caseStudy.headline}</h3>
        <p className="mt-4 leading-relaxed text-muted">{caseStudy.body}</p>
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
        <a
          href={caseStudy.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block text-sm underline decoration-border underline-offset-4 transition-colors hover:text-accent"
        >
          Source: {caseStudy.sourceLabel} &rarr;
        </a>
      </article>
    </Reveal>
  );
}
