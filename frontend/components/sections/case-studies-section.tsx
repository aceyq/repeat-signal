import { Reveal } from "@/components/ui/reveal";
import { CaseStudyCard } from "@/components/cards/case-study-card";
import { CASE_STUDIES } from "@/lib/case-studies";

export function CaseStudiesSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-32">
      <Reveal>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Chapter 05 &middot; The Stories</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
          What the data can&apos;t show, but the public record can
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Every incident in the charts above is a single anonymous row — a category, a
          neighborhood, a month. Nothing in that data can tell us about a specific person. But
          separately from it, journalists and the cities&apos; own review committees have already
          made parts of this pattern public, case by case and report by report. One per city,
          below, each linked to its original public source. Click a card to read the full case.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {CASE_STUDIES.map((caseStudy, i) => (
          <CaseStudyCard key={caseStudy.city} caseStudy={caseStudy} delay={0.1 * i} />
        ))}
      </div>

      <Reveal delay={0.4}>
        <p className="mt-10 max-w-2xl text-sm text-muted">
          None of this implies any of the incidents in this project&apos;s dataset involve the
          people named above — these cases are drawn entirely from already-published reporting
          and government reports, cited at their source, not from re-identifying anyone in the
          open incident data. See{" "}
          <a
            href="https://github.com/aceyq/repeat-signal/blob/main/docs/ETHICS.md"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-4 hover:text-accent"
          >
            docs/ETHICS.md
          </a>{" "}
          for the full policy.
        </p>
      </Reveal>
    </section>
  );
}
