import { api } from "@/lib/api";

// Temporary placeholder home page -- exists in Milestone 4 to prove the
// frontend can actually reach the live backend end to end. The real
// scrollytelling hero replaces this in Milestone 5.
export default async function Home() {
  const summary = await api.getSummary();

  const cityLabels: Record<string, string> = {
    chicago: "Chicago",
    nyc: "New York City",
    sf: "San Francisco",
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <p className="text-sm uppercase tracking-[0.2em] text-muted">Milestone 4 &mdash; frontend scaffold</p>
      <h1 className="mt-4 font-display text-5xl font-medium tracking-tight sm:text-6xl">
        Repeat Signal
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">
        An interactive data-storytelling project exploring patterns in public police report and
        911 call-for-service data across three cities. This page is a temporary placeholder
        confirming the frontend can reach the live backend &mdash; the real homepage arrives in
        Milestone 5.
      </p>

      <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-6">
          <dt className="text-sm text-muted">Total incidents (2yr window)</dt>
          <dd className="mt-2 font-display text-3xl">{summary.total_incidents.toLocaleString()}</dd>
        </div>
        {summary.cities.map((city) => (
          <div key={city.city} className="rounded-lg border border-border bg-surface p-6">
            <dt className="text-sm text-muted">{cityLabels[city.city] ?? city.city}</dt>
            <dd className="mt-2 font-display text-3xl">{city.incident_count.toLocaleString()}</dd>
            <dd className="mt-1 text-xs text-muted">
              {city.date_range_start} &rarr; {city.date_range_end}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
