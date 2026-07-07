import { Reveal } from "@/components/ui/reveal";

export function ContinueSection() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <Reveal>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">What follows</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Not a verdict &mdash; a set of patterns, shown plainly
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          The map and charts above show where these incidents cluster and how they shift over
          time and category &mdash; they don&apos;t show why, or what should be done about it.
          Next: specific, already-public cases that put a human face on what the numbers show.
          Every section carries its limits with it, the same way this one did.
        </p>
      </Reveal>
      <Reveal delay={0.35}>
        <p className="mt-10 text-sm text-muted">
          The case studies are under construction &mdash; next up in this build.
        </p>
      </Reveal>
    </section>
  );
}
