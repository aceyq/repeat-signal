// Mirrors backend/app/schemas.py -- keep these two in sync by hand for now.
// (Milestone 4 scope; an OpenAPI-generated client is a reasonable later upgrade
// but not worth the extra tooling for five endpoints yet.)

export type City = "chicago" | "nyc" | "sf";

export interface CityStats {
  city: City;
  incident_count: number;
  date_range_start: string; // ISO date
  date_range_end: string; // ISO date
}

export interface CategoryStats {
  category: string;
  incident_count: number;
}

export interface NeighborhoodSummary {
  id: string;
  city: City;
  name: string;
}

export interface GeoJsonGeometry {
  type: string;
  coordinates: unknown;
}

export interface NeighborhoodDetail extends NeighborhoodSummary {
  geometry: GeoJsonGeometry;
}

export interface AggregateRow {
  city: City;
  year_month: string; // ISO date, first of month
  category: string;
  neighborhood_id: string | null;
  neighborhood_name: string | null;
  incident_count: number;
  chicago_domestic_flag_count: number | null;
}

export interface Summary {
  total_incidents: number;
  date_range_start: string;
  date_range_end: string;
  cities: CityStats[];
}
