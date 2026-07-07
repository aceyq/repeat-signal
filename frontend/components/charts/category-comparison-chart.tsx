"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useChartWidth } from "@/hooks/use-chart-width";
import { CITY_ORDER } from "@/lib/map-config";
import { resolveCssColor } from "@/lib/color-utils";
import { formatCategoryLabel } from "@/lib/format";
import type { CategoryTrend, CityStats } from "@/lib/types";

const MARGIN = { top: 8, right: 48, bottom: 8, left: 168 };
const ROW_HEIGHT = 64;
const TOP_N_CATEGORIES = 8;

export function CategoryComparisonChart({
  categoryTrends,
  cityTotals,
}: {
  categoryTrends: CategoryTrend[];
  cityTotals: CityStats[];
}) {
  const { ref: containerRef, width } = useChartWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || width === 0 || categoryTrends.length === 0) return;

    const totalByCity = new Map(cityTotals.map((c) => [c.city, c.incident_count]));
    const withShare = categoryTrends.map((row) => ({
      ...row,
      share: (row.incident_count / (totalByCity.get(row.city) ?? 1)) * 100,
    }));

    const totalByCategory = d3.rollup(
      withShare,
      (rows) => d3.sum(rows, (r) => r.incident_count),
      (r) => r.category,
    );
    const topCategories = Array.from(totalByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N_CATEGORIES)
      .map(([category]) => category);

    const byCategory = d3.group(
      withShare.filter((r) => topCategories.includes(r.category)),
      (r) => r.category,
    );

    const height = topCategories.length * ROW_HEIGHT;
    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const mutedColor = resolveCssColor("--muted");
    const foregroundColor = resolveCssColor("--foreground");
    const borderColor = resolveCssColor("--border");

    const yCategory = d3.scaleBand().domain(topCategories).range([0, innerHeight]).paddingInner(0.35);
    const yCity = d3
      .scaleBand()
      .domain(CITY_ORDER.map((c) => c.id))
      .range([0, yCategory.bandwidth()])
      .paddingInner(0.15);
    const xShare = d3
      .scaleLinear()
      .domain([0, d3.max(withShare, (d) => d.share) ?? 1])
      .nice()
      .range([0, innerWidth]);

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Category row labels
    g.append("g")
      .selectAll("text")
      .data(topCategories)
      .join("text")
      .attr("x", -12)
      .attr("y", (d) => (yCategory(d) ?? 0) + yCategory.bandwidth() / 2)
      .attr("dy", "0.32em")
      .attr("text-anchor", "end")
      .attr("fill", foregroundColor)
      .attr("font-size", 13)
      .text((d) => formatCategoryLabel(d));

    // Baseline
    g.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", borderColor);

    for (const category of topCategories) {
      const rows = byCategory.get(category) ?? [];
      const rowG = g.append("g").attr("transform", `translate(0,${yCategory(category)})`);

      rowG
        .selectAll("rect")
        .data(CITY_ORDER.map((meta) => rows.find((r) => r.city === meta.id)).filter((r) => r !== undefined))
        .join("rect")
        .attr("y", (d) => yCity(d.city) ?? 0)
        .attr("height", yCity.bandwidth())
        .attr("x", 0)
        .attr("width", (d) => xShare(d.share))
        .attr("fill", (d) => resolveCssColor(CITY_ORDER.find((c) => c.id === d.city)!.accentVar))
        .attr("rx", 3)
        .append("title")
        .text((d) => `${d.city}: ${d.share.toFixed(1)}% of that city's incidents`);

      rowG
        .selectAll("text.value")
        .data(CITY_ORDER.map((meta) => rows.find((r) => r.city === meta.id)).filter((r) => r !== undefined))
        .join("text")
        .attr("class", "value")
        .attr("y", (d) => (yCity(d.city) ?? 0) + yCity.bandwidth() / 2)
        .attr("dy", "0.32em")
        .attr("x", (d) => xShare(d.share) + 6)
        .attr("font-size", 11)
        .attr("fill", mutedColor)
        .text((d) => `${d.share.toFixed(1)}%`);
    }
  }, [categoryTrends, cityTotals, width]);

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        role="img"
        aria-label="Share of each city's incidents by category, top 8 categories"
      />
    </div>
  );
}
