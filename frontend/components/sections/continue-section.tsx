import { Reveal } from "@/components/ui/reveal";

export function ContinueSection() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <Reveal>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">In closing</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          A number is not a person
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Every count on this page started as something specific &mdash; a phone ringing, an
          address given out loud, a name typed into a form by whoever picked up. Two years of
          that becomes a row: a category, a neighborhood, a month. That&apos;s what the public
          record can honestly offer. It&apos;s still worth remembering, this far into the scroll,
          that underneath each one is a night someone actually lived through.
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          This project can&apos;t tell you why any single number moved, or name who was on the
          other end of a specific call. It can&apos;t prove a policy is failing, and treating a
          pattern as proof of one would be dishonest. What it can do is show you where a pattern
          exists, clearly enough to be worth investigating further &mdash; which isn&apos;t the
          same as answering the question. The cases earlier aren&apos;t evidence for the citywide
          totals; they&apos;re a reminder that patterns like these are already being found, one
          case at a time, by people willing to look closely. If something here raised a question
          the charts couldn&apos;t settle, that&apos;s the honest edge of what this kind of data
          can tell you &mdash; not a reason to stop asking it.
        </p>
      </Reveal>
      <Reveal delay={0.4}>
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
