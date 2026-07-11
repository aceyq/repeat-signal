import { Reveal } from "@/components/ui/reveal";

type EventType = "call" | "dispatch" | "custody" | "outcome";

interface TimelineEvent {
  id: string;
  time: string;
  type: EventType;
  label: string;
}

/**
 * Every event and timestamp here is a real, cited fact from San Francisco's
 * DVDRT Pilot Report (2023) chronology (see docs/CASE_STUDIES.md) -- the same
 * primary source as Chapter 1's quote and the SF case study card. This
 * project's incident-level data has no response-time or dispatch-arrival
 * field for any of the three cities (confirmed against docs/DATA_DICTIONARY.md
 * before building this chapter), so "response statistics" here means the real,
 * fully-documented timeline of one case, not aggregate stats the dataset
 * doesn't contain. Keep every label a fact, not an inference -- the report
 * itself never characterizes any single response as slow; each visit
 * happened within minutes of a call. What it documents is a gap in shared
 * context between separate responses, not response speed.
 *
 * Timestamps prefixed "~" are this project's own arithmetic from the
 * report's relative statements (e.g. "five minutes later", "within three
 * minutes") rather than an absolute time stated directly in the source --
 * flagged so a future editor doesn't mistake them for directly-quoted times.
 */
const TIMELINE: TimelineEvent[] = [
  { id: "e1", time: "8:37 PM", type: "call", label: "First call. She says he's leaving; no response requested." },
  { id: "e2", time: "9:14 PM", type: "call", label: "Second call. He won't stop ringing the doorbell." },
  { id: "e3", time: "~9:19 PM", type: "call", label: "A roommate calls too. Coded as a fight in progress." },
  { id: "e4", time: "9:33 PM", type: "call", label: "Third call. Officers are already on their way." },
  {
    id: "e5",
    time: "~9:35 PM",
    type: "dispatch",
    label: "First police visit, within minutes. No evidence of a crime; he agrees to leave.",
  },
  {
    id: "e6",
    time: "10:10 PM",
    type: "call",
    label: '"I\'m getting a little bit more, um, scared, because it\'s an escalating domestic violence situation."',
  },
  {
    id: "e7",
    time: "10:20 PM",
    type: "dispatch",
    label: "Second police visit. Arrested for public intoxication, held in a sobering cell.",
  },
  {
    id: "e8",
    time: "~3:45 AM",
    type: "custody",
    label: "Released after roughly four hours. No further evaluation required by policy.",
  },
  { id: "e9", time: "4:00 AM", type: "call", label: "Fourth and fifth calls. He's on his way back." },
  {
    id: "e10",
    time: "~4:03 AM",
    type: "dispatch",
    label: "Third police visit, within three minutes. He collects his things and leaves, escorted by officers.",
  },
  { id: "e11", time: "4:55 AM", type: "outcome", label: "He returns a third time. She is killed, then he takes his own life." },
];

const TYPE_LABEL: Record<EventType, string> = {
  call: "911 call",
  dispatch: "Police response",
  custody: "In custody",
  outcome: "Outcome",
};

function TimelineRow({ event, delay, isLast }: { event: TimelineEvent; delay: number; isLast: boolean }) {
  return (
    <Reveal delay={delay} className="relative flex gap-6 pb-10">
      {!isLast && <span className="absolute left-[5.5rem] top-6 h-full w-px bg-border sm:left-24" />}
      <span className="w-16 shrink-0 pt-1 text-right font-mono text-xs text-muted sm:w-20 sm:text-sm">
        {event.time}
      </span>
      <span className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-border bg-background">
        {event.type === "outcome" && <span className="absolute inset-0 rounded-full bg-foreground" />}
      </span>
      <div className="flex-1 pb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{TYPE_LABEL[event.type]}</p>
        <p className="mt-1.5 max-w-xl leading-relaxed text-foreground">{event.label}</p>
      </div>
    </Reveal>
  );
}

export function ResponseChapter() {
  return (
    <section id="chapter-2" className="mx-auto max-w-3xl scroll-mt-24 px-6 py-32">
      <Reveal>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Chapter 02 &middot; The Response</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Every call got a response
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          This is the same San Francisco case from the opening scene, minute by minute, drawn entirely
          from the city&apos;s own review of it. Each visit happened within minutes of a call. What
          the record shows isn&apos;t a slow response &mdash; it&apos;s a gap between one response and
          the next.
        </p>
      </Reveal>

      <div className="mt-16">
        {TIMELINE.map((event, i) => (
          <TimelineRow key={event.id} event={event} delay={Math.min(i * 0.05, 0.3)} isLast={i === TIMELINE.length - 1} />
        ))}
      </div>

      <Reveal delay={0.1} className="mt-4 max-w-2xl border-t border-border pt-8">
        <p className="text-sm text-muted">
          Source:{" "}
          <a
            href="https://www.sf.gov/sites/default/files/2023-06/2023%20San%20Francisco%20Domestic%20Violence%20Death%20Review%20Team%20(DVDRT)%20Pilot%20Report.pdf"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-4 hover:text-accent-sf"
          >
            San Francisco DVDRT Pilot Report (2023)
          </a>{" "}
          &mdash; full case context in{" "}
          <a href="#case-study-sf" className="underline decoration-border underline-offset-4 hover:text-accent-sf">
            The Stories
          </a>
          .
        </p>
      </Reveal>
    </section>
  );
}
