import { Reveal } from "@/components/ui/reveal";

const LIMITS = [
  {
    title: "Reported, not total",
    body: "These are incidents someone reported — not everything that happened. Underreporting varies by category and by neighborhood, often for well-documented reasons that have nothing to do with actual safety.",
  },
  {
    title: "Approximate, not exact",
    body: "Locations are block-level or precinct-level, deliberately, for privacy. No chart here can or should point to a specific address.",
  },
  {
    title: "Normalized, not identical",
    body: "Chicago, New York, and San Francisco each categorize incidents differently. Every comparison across cities passes through a mapping we chose and documented — it's an approximation, not a universal truth.",
  },
  {
    title: "Context, never proof",
    body: "Where demographic data exists in the source, it's incomplete, and it is shown only as context for exploration — never as evidence of bias, discrimination, or intent.",
  },
];

export function LimitsSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-32">
      <Reveal>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">What this can&apos;t show</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Patterns are not proof
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {LIMITS.map((limit, i) => (
          <Reveal key={limit.title} delay={0.15 + i * 0.08}>
            <h3 className="font-display text-xl">{limit.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{limit.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.5}>
        <a
          href="https://github.com/aceyq/repeat-signal/blob/main/docs/ETHICS.md"
          target="_blank"
          rel="noreferrer"
          className="mt-12 inline-block text-sm underline decoration-border underline-offset-4 transition-colors hover:text-accent"
        >
          Read the full data limitations &amp; ethics policy &rarr;
        </a>
      </Reveal>
    </section>
  );
}
