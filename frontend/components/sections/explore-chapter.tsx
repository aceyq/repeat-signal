"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { api } from "@/lib/api";
import { CITY_ORDER } from "@/lib/map-config";
import { resolveCssColor } from "@/lib/color-utils";
import { formatCategoryLabel } from "@/lib/format";
import type { CategoryStats, City } from "@/lib/types";

const TOP_N_NEIGHBORHOODS = 8;

/**
 * Deliberately its own, local state -- not the shared FilterProvider context
 * that Chapters 3-4 use to stay in sync with each other. Explore lets you
 * pick from all ~21 categories (not just the top 8 shown in Chapter 4's
 * chart), and changing a selection here shouldn't silently re-filter a
 * chapter the reader has already scrolled past. Self-contained sandbox, not
 * another connected piece of the documentary.
 */
export function ExploreChapter({ categories }: { categories: CategoryStats[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [city, setCity] = useState<City>(CITY_ORDER[0].id);
  const [category, setCategory] = useState<string | null>(null);

  // Keyed by which city+category it was fetched for, rather than a separate
  // `loading` flag reset to true at the top of the effect -- avoids the
  // synchronous setState-in-effect pattern (same reasoning as
  // monthly-trend-chart.tsx's categoryData state). `loading` below is derived,
  // not stored.
  const [result, setResult] = useState<{
    city: City;
    category: string | null;
    rows: { neighborhood_name: string | null; incident_count: number }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getAggregates({ city, category: category ?? undefined, limit: 20000 }).then((data) => {
      if (cancelled) return;
      setResult({
        city,
        category,
        rows: data.map((r) => ({ neighborhood_name: r.neighborhood_name, incident_count: r.incident_count })),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [city, category]);

  const loading = result === null || result.city !== city || result.category !== category;
  const rows = useMemo(() => (!result || loading ? [] : result.rows), [loading, result]);

  const { total, topNeighborhoods } = useMemo(() => {
    const byNeighborhood = new Map<string, number>();
    let sum = 0;
    for (const row of rows) {
      sum += row.incident_count;
      const name = row.neighborhood_name ?? "Unknown";
      byNeighborhood.set(name, (byNeighborhood.get(name) ?? 0) + row.incident_count);
    }
    const ranked = Array.from(byNeighborhood.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N_NEIGHBORHOODS);
    return { total: sum, topNeighborhoods: ranked };
  }, [rows]);

  const cityMeta = CITY_ORDER.find((c) => c.id === city)!;
  const maxCount = topNeighborhoods[0]?.[1] ?? 1;

  return (
    <section className="mx-auto max-w-3xl px-6 py-32">
      <Reveal>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Chapter 06 &middot; Explore</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Everything above followed a script. This doesn&apos;t.
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Pick a city and a category from the full taxonomy &mdash; not just the ones already
          charted above &mdash; and see which neighborhoods it shows up in most, over the full
          two-year window.
        </p>
      </Reveal>

      <Reveal delay={0.3} className="mt-10">
        <div className="flex flex-wrap gap-2">
          {CITY_ORDER.map((meta) => (
            <button
              key={meta.id}
              type="button"
              onClick={() => setCity(meta.id)}
              aria-pressed={city === meta.id}
              className="rounded-full border px-4 py-1.5 text-sm transition-colors"
              style={{
                borderColor: city === meta.id ? `var(${meta.accentVar})` : "var(--border)",
                color: city === meta.id ? `var(${meta.accentVar})` : "var(--muted)",
              }}
            >
              {meta.label}
            </button>
          ))}
        </div>

        <select
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value || null)}
          className="mt-4 w-full max-w-sm rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {formatCategoryLabel(c.category)}
            </option>
          ))}
        </select>
      </Reveal>

      <Reveal delay={0.4} className="mt-10 rounded-lg border border-border bg-surface p-6">
        {loading ? (
          <p className="text-sm text-muted">Loading&hellip;</p>
        ) : (
          <>
            <p className="text-sm text-muted">
              {category ? formatCategoryLabel(category) : "All categories"} in {cityMeta.label}
            </p>
            <p className="mt-1 font-display text-3xl font-medium tracking-tight">
              {total.toLocaleString()} <span className="text-lg text-muted">incidents</span>
            </p>

            <div className="mt-6 space-y-3">
              {topNeighborhoods.map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-foreground">{name}</span>
                    <span className="text-muted">{count.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-background">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: resolveCssColor(cityMeta.accentVar) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
              {topNeighborhoods.length === 0 && (
                <p className="text-sm text-muted">No incidents recorded for this combination.</p>
              )}
            </div>
          </>
        )}
      </Reveal>
    </section>
  );
}
