import { AnimatedNumber } from "@/components/ui/animated-number";
import { Reveal } from "@/components/ui/reveal";
import type { Summary } from "@/lib/types";

const CITY_LABELS: Record<string, string> = {
  chicago: "Chicago",
  nyc: "New York City",
  sf: "San Francisco",
};

const CITY_ACCENT_VAR: Record<string, string> = {
  chicago: "var(--accent-chicago)",
  nyc: "var(--accent-nyc)",
  sf: "var(--accent-sf)",
};

export function StatsSection({ summary }: { summary: Summary }) {
  return (
    <section className="border-y border-border bg-surface/50">
      <div className="mx-auto max-w-4xl px-6 py-32">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">The scale</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
            <AnimatedNumber value={summary.total_incidents} /> reports. Three cities. Two years.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {summary.cities.map((city, i) => (
            <Reveal key={city.city} delay={0.15 + i * 0.1}>
              <div
                className="rounded-lg border border-border bg-surface p-6"
                style={{ borderTopColor: CITY_ACCENT_VAR[city.city], borderTopWidth: 3 }}
              >
                <p className="text-sm text-muted">{CITY_LABELS[city.city] ?? city.city}</p>
                <p className="mt-2 font-display text-3xl">
                  <AnimatedNumber value={city.incident_count} />
                </p>
                <p className="mt-2 text-xs text-muted">
                  {city.date_range_start} &rarr; {city.date_range_end}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
