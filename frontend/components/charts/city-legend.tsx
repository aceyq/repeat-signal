import { CITY_ORDER } from "@/lib/map-config";

export function CityLegend() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {CITY_ORDER.map((city) => (
        <div key={city.id} className="flex items-center gap-2 text-sm text-muted">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `var(${city.accentVar})` }} />
          {city.label}
        </div>
      ))}
    </div>
  );
}
