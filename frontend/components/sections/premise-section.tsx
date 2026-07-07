import { Reveal } from "@/components/ui/reveal";

export function PremiseSection() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-32">
      <Reveal>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Where this started</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          A pattern noticed in hindsight
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted">
          <p>
            True crime reporting keeps turning up the same detail: before something terrible
            happened, someone had already called. Once. Twice. Sometimes many times. The calls
            existed in a system &mdash; they just weren&apos;t connected until it was too late.
          </p>
          <p>
            That raised a question worth asking carefully, with actual data: do public safety
            records show measurable patterns in repeat contact? And if they do, what can they
            responsibly tell us &mdash; and just as importantly, what can&apos;t they?
          </p>
        </div>
      </Reveal>
    </section>
  );
}
