import type { City } from "./types";

// OpenFreeMap: free, tokenless vector tile styles -- no API key/account needed,
// which is exactly why MapLibre (not Mapbox GL) was chosen for this project
// (see docs/ARCHITECTURE.md). Verified live before use.
export const MAP_STYLE_LIGHT = "https://tiles.openfreemap.org/styles/positron";
export const MAP_STYLE_DARK = "https://tiles.openfreemap.org/styles/dark";

export interface CityMeta {
  id: City;
  label: string;
  accentVar: string; // CSS custom property name, resolved at runtime for map paint expressions
}

export const CITY_ORDER: CityMeta[] = [
  { id: "chicago", label: "Chicago", accentVar: "--accent-chicago" },
  { id: "nyc", label: "New York City", accentVar: "--accent-nyc" },
  { id: "sf", label: "San Francisco", accentVar: "--accent-sf" },
];
