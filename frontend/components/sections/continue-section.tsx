import { Reveal } from "@/components/ui/reveal";

export function ContinueSection() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <Reveal>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">In closing</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Not a verdict &mdash; a set of patterns, shown plainly
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          The map and charts above show where these incidents cluster and how they shift over
          time and category. The case studies show that the pattern this project set out to
          measure is already documented, city by city, in the public record. Neither one proves
          the other &mdash; the data can&apos;t name a person, and a handful of cited cases can&apos;t
          establish a citywide trend. Read together, with their limits attached, they&apos;re the
          most honest picture this project can offer.
        </p>
      </Reveal>
      <Reveal delay={0.35}>
        <p className="mt-10 text-sm text-muted">
          Built end to end &mdash; data pipeline, backend, and this page &mdash; and documented at
          every step in the project&apos;s{" "}
          <a
            href="https://github.com/aceyq/repeat-signal"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-4 hover:text-accent"
          >
            GitHub repository
          </a>
          .
        </p>
      </Reveal>
    </section>
  );
}
