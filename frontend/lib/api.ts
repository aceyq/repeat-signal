import type {
  AggregateRow,
  CategoryStats,
  City,
  CityStats,
  NeighborhoodDetail,
  NeighborhoodSummary,
  Summary,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new ApiError(response.status, `${response.status} ${response.statusText} for ${url}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getSummary: () => apiFetch<Summary>("/api/summary"),
  getCities: () => apiFetch<CityStats[]>("/api/cities"),
  getCategories: () => apiFetch<CategoryStats[]>("/api/categories"),
  getNeighborhoods: (city?: City) =>
    apiFetch<NeighborhoodSummary[]>("/api/neighborhoods", { city }),
  getNeighborhood: (id: string) => apiFetch<NeighborhoodDetail>(`/api/neighborhoods/${id}`),
  getAggregates: (filters?: {
    city?: City;
    category?: string;
    neighborhood_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) => apiFetch<AggregateRow[]>("/api/aggregates", filters),
};
