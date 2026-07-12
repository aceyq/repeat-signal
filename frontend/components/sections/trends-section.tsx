"use client";

import { Reveal } from "@/components/ui/reveal";
import { ChapterIntro } from "@/components/ui/chapter-intro";
import { FilterChip } from "@/components/ui/filter-chip";
import { CityLegend } from "@/components/charts/city-legend";
import MonthlyTrendChart from "@/components/charts/monthly-trend-chart-lazy";
import CategoryComparisonChart from "@/components/charts/category-comparison-chart-lazy";
import { useFilter } from "@/lib/filter-context";
import { formatCategoryLabel } from "@/lib/format";
import { CITY_ORDER } from "@/lib/map-config";
import type { CategoryTrend, CityStats, MonthlyTrend } from "@/lib/types";

export function TrendsSection({
  monthlyTrends,
  categoryTrends,
  cityTotals,
}: {
  monthlyTrends: MonthlyTrend[];
  categoryTrends: CategoryTrend[];
  cityTotals: CityStats[];
}) {
  const { selectedCategory, selectedCity, toggleCategory, toggleCity } = useFilter();
  const cityLabel = selectedCity ? CITY_ORDER.find((c) => c.id === selectedCity)?.label : null;
  const hasActiveFilter = selectedCategory || selectedCity;

  // Real findings, stated in words, computed from the same props the charts
  // themselves draw from -- so the reader meets each one as a sentence before
  // meeting it again as a shape (see charts' `entranceDelay`, below).
  const grandTotal = cityTotals.reduce((sum, c) => sum + c.incident_count, 0);
  const topVolumeCity =
    cityTotals.length > 0
      ? cityTotals.reduce((a, b) => (a.incident_count >= b.incident_count ? a : b))
      : null;
  const topVolumeCityLabel = topVolumeCity
    ? (CITY_ORDER.find((c) => c.id === topVolumeCity.city)?.label ?? topVolumeCity.city)
    : null;
  const topVolumeShare =
    topVolumeCity && grandTotal > 0 ? Math.round((topVolumeCity.incident_count / grandTotal) * 100) : null;

  const topCategoryByCity = CITY_ORDER.map((meta) => {
    const rows = categoryTrends.filter((r) => r.city === meta.id);
    const top = rows.length > 0 ? rows.reduce((a, b) => (a.incident_count >= b.incident_count ? a : b)) : null;
    return { cityLabel: meta.label, category: top ? formatCategoryLabel(top.category) : null };
  }).filter((row): row is { cityLabel: string; category: string } => row.category !== null);
  const allSameTopCategory =
    topCategoryByCity.length > 1 && topCategoryByCity.every((row) => row.category === topCategoryByCity[0].category);

  return (
    <section id="chapter-4" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-32">
      <ChapterIntro>
        <Reveal>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Chapter 04 &middot; The Data</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
            The shape of two years
          </h2>
        </Reveal>
      </ChapterIntro>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Monthly incident counts across the full window, one line per city. Watch for
          seasonality, sudden jumps, and the gap between cities of very different sizes &mdash;
          the shapes matter more here than the absolute totals. Click a city below to isolate its
          line, or a category in the chart further down to filter both charts and the map above.
        </p>
      </Reveal>

      {hasActiveFilter && (
        <Reveal delay={0.25} className="mt-6 flex flex-wrap gap-2">
          {selectedCategory && (
            <FilterChip
              label={`Category: ${formatCategoryLabel(selectedCategory)}`}
              onClear={() => toggleCategory(selectedCategory)}
            />
          )}
          {selectedCity && cityLabel && (
            <FilterChip label={`City: ${cityLabel}`} onClear={() => toggleCity(selectedCity)} />
          )}
        </Reveal>
      )}

      {topVolumeCityLabel && topVolumeShare !== null && (
        <Reveal delay={0.3} className="mt-10 max-w-2xl">
          <p className="font-display text-2xl font-medium leading-snug text-foreground sm:text-3xl">
            {topVolumeCityLabel} alone accounts for {topVolumeShare}% of every incident recorded here.
          </p>
        </Reveal>
      )}

      <Reveal delay={0.35} className="mt-10">
        <CityLegend />
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <MonthlyTrendChart data={monthlyTrends} entranceDelay={700} />
        </div>
      </Reveal>

      <div className="mt-28">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">By category</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
            What&apos;s most common isn&apos;t the same everywhere
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Shown as each category&apos;s share of that city&apos;s own total &mdash; not raw
            counts, since New York&apos;s volume alone would otherwise drown out Chicago and San
            Francisco entirely. The top 8 categories by combined volume across all three cities.
          </p>
        </Reveal>

        {topCategoryByCity.length > 0 && (
          <Reveal delay={0.3} className="mt-10 max-w-2xl">
            <p className="font-display text-2xl font-medium leading-snug text-foreground sm:text-3xl">
              {allSameTopCategory ? (
                <>Every city&apos;s most-reported category is the same: {topCategoryByCity[0].category}.</>
              ) : (
                topCategoryByCity.map((row, i) => (
                  <span key={row.cityLabel}>
                    {i > 0 && " "}
                    {i === 0
                      ? `${row.cityLabel}'s most common category is ${row.category}.`
                      : `${row.cityLabel}'s is ${row.category}.`}
                  </span>
                ))
              )}
            </p>
          </Reveal>
        )}

        <Reveal delay={0.35} className="mt-10">
          <CityLegend />
          <div className="mt-4 rounded-lg border border-border bg-surface p-4">
            <CategoryComparisonChart categoryTrends={categoryTrends} cityTotals={cityTotals} entranceDelay={700} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
