"use client";

// See map-section-lazy.tsx for why this wrapper exists (ssr: false is only allowed
// inside a Client Component, and trends-section.tsx is a Server Component).
import dynamic from "next/dynamic";

const CategoryComparisonChart = dynamic(
  () => import("./category-comparison-chart").then((m) => m.CategoryComparisonChart),
  { ssr: false, loading: () => <div style={{ height: 512 }} /> },
);

export default CategoryComparisonChart;
