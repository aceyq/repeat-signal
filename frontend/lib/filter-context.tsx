"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { City } from "./types";

interface FilterContextValue {
  selectedCategory: string | null;
  toggleCategory: (category: string) => void;
  selectedCity: City | null;
  toggleCity: (city: City) => void;
  clearAll: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

/**
 * Shared click-to-filter state for the map + trend/category charts (Milestone
 * 9.5 follow-up): selecting a category filters the map's choropleth and both
 * charts together; selecting a city isolates its line/bars. Lives above both
 * sections so state survives scrolling between them.
 */
export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const value = useMemo<FilterContextValue>(
    () => ({
      selectedCategory,
      toggleCategory: (category) =>
        setSelectedCategory((current) => (current === category ? null : category)),
      selectedCity,
      toggleCity: (city) => setSelectedCity((current) => (current === city ? null : city)),
      clearAll: () => {
        setSelectedCategory(null);
        setSelectedCity(null);
      },
    }),
    [selectedCategory, selectedCity],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within a FilterProvider");
  return ctx;
}
