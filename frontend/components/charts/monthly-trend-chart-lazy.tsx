"use client";

// See map-section-lazy.tsx for why this wrapper exists (ssr: false is only allowed
// inside a Client Component, and trends-section.tsx is a Server Component).
import dynamic from "next/dynamic";

const MonthlyTrendChart = dynamic(
  () => import("./monthly-trend-chart").then((m) => m.MonthlyTrendChart),
  { ssr: false, loading: () => <div style={{ height: 360 }} /> },
);

export default MonthlyTrendChart;
