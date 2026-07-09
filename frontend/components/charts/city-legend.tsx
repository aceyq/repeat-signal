"use client";

import { CITY_ORDER } from "@/lib/map-config";
import { useFilter } from "@/lib/filter-context";

/** Doubles as a click-to-isolate control: selecting a city dims the others in
 * whichever chart is currently listening (see monthly-trend-chart.tsx and
 * category-comparison-chart.tsx). Plain legend swatches otherwise, just wrapped
 * in real buttons so this is keyboard/screen-reader reachable, unlike clicking
 * a thin SVG line directly. */
export function CityLegend() {
  const { selectedCity, toggleCity } = useFilter();

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-2">
      {CITY_ORDER.map((city) => {
        const dimmed = selectedCity !== null && selectedCity !== city.id;
        return (
          <button
            key={city.id}
            type="button"
            onClick={() => toggleCity(city.id)}
            aria-pressed={selectedCity === city.id}
            className="flex items-center gap-2 rounded-full px-2 py-1 text-sm text-muted transition-opacity hover:opacity-100"
            style={{ opacity: dimmed ? 0.45 : 1 }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `var(${city.accentVar})` }} />
            {city.label}
          </button>
        );
      })}
    </div>
  );
}
