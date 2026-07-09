"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useChartWidth } from "@/hooks/use-chart-width";
import { CITY_ORDER } from "@/lib/map-config";
import { resolveCssColor } from "@/lib/color-utils";
import { formatCategoryLabel } from "@/lib/format";
import { useFilter } from "@/lib/filter-context";
import type { CategoryTrend, CityStats } from "@/lib/types";

const ROW_HEIGHT = 64;
const TOP_N_CATEGORIES = 8;
const LABEL_PADDING = 12; // gap between wrapped label text and the axis line at x=0
const NARROW_BREAKPOINT = 480; // below this, the fixed desktop margin eats too much of the width

/** A fixed 168px left margin is fine at desktop widths but eats nearly half of a
 * ~390px mobile screen -- scale it (and the label font size) down on narrow
 * containers instead, relying on wrapLabel to still fit the text. */
function getMargin(width: number) {
  const isNarrow = width < NARROW_BREAKPOINT;
  return { top: 8, right: isNarrow ? 40 : 48, bottom: 8, left: isNarrow ? 108 : 168 };
}

/** Wraps a right-aligned <text> label onto as many lines as needed to fit `maxWidth`,
 * then re-centers the whole block vertically -- rather than letting long labels (e.g.
 * "Criminal damage vandalism") overflow past the SVG's left edge and get clipped. */
function wrapLabel(selection: d3.Selection<SVGTextElement, string, SVGGElement, unknown>, maxWidth: number) {
  selection.each(function () {
    const node = d3.select(this);
    const words = (node.text() || "").split(/\s+/).reverse();
    const x = node.attr("x");
    node.text(null);

    let word: string | undefined;
    let line: string[] = [];
    const lines: string[] = [];
    let tspan = node.append("tspan").attr("x", x);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if ((tspan.node() as SVGTSpanElement).getComputedTextLength() > maxWidth && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        lines.push(line.join(" "));
        line = [word];
        tspan = node.append("tspan").attr("x", x).text(word);
      }
    }
    lines.push(line.join(" "));

    // SVG tspan `dy` is relative to the *previous* tspan's baseline, not the parent --
    // so only the first line needs the full centering offset; every following line
    // just needs one more line-height step down from where the previous one landed.
    const lineHeightEm = 1.1;
    const startDy = -((lines.length - 1) * lineHeightEm) / 2 + 0.32; // 0.32em matches the row's single-line vertical-center baseline
    node.selectAll("tspan").attr("dy", (_, i) => ((i as number) === 0 ? `${startDy}em` : `${lineHeightEm}em`));
  });
}

export function CategoryComparisonChart({
  categoryTrends,
  cityTotals,
}: {
  categoryTrends: CategoryTrend[];
  cityTotals: CityStats[];
}) {
  const { ref: containerRef, width } = useChartWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const { selectedCategory, toggleCategory, selectedCity } = useFilter();

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

    const isNarrow = width < NARROW_BREAKPOINT;
    const MARGIN = getMargin(width);
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

    const isDimmedCategory = (category: string) => selectedCategory !== null && selectedCategory !== category;
    const barOpacity = (category: string, city: string) => {
      const cityDimmed = selectedCity !== null && selectedCity !== city;
      return isDimmedCategory(category) || cityDimmed ? 0.3 : 1;
    };

    // Category row labels -- wrapped onto multiple lines rather than clipped when a
    // label (e.g. "Criminal damage vandalism") is too long to fit on one line.
    // Clickable: selecting a category filters the map + monthly trend chart together.
    const categoryLabels = g
      .append("g")
      .selectAll<SVGTextElement, string>("text")
      .data(topCategories)
      .join("text")
      .attr("x", -LABEL_PADDING)
      .attr("y", (d) => (yCategory(d) ?? 0) + yCategory.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("fill", foregroundColor)
      .attr("font-size", isNarrow ? 11 : 13)
      .attr("font-weight", (d) => (selectedCategory === d ? 600 : 400))
      .attr("opacity", (d) => (isDimmedCategory(d) ? 0.45 : 1))
      .style("cursor", "pointer")
      .on("click", (_event, d) => toggleCategory(d))
      .text((d) => formatCategoryLabel(d));
    wrapLabel(categoryLabels, MARGIN.left - LABEL_PADDING * 2);

    // Baseline
    g.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", borderColor);

    for (const category of topCategories) {
      const rows = byCategory.get(category) ?? [];
      const rowG = g
        .append("g")
        .attr("transform", `translate(0,${yCategory(category)})`)
        .style("cursor", "pointer")
        .on("click", () => toggleCategory(category));

      if (selectedCategory === category) {
        rowG
          .insert("rect", ":first-child")
          .attr("x", -MARGIN.left + 4)
          .attr("y", -6)
          .attr("width", innerWidth + MARGIN.left - 4)
          .attr("height", yCategory.bandwidth() + 12)
          .attr("fill", borderColor)
          .attr("opacity", 0.3)
          .attr("rx", 8);
      }

      rowG
        .selectAll("rect.bar")
        .data(CITY_ORDER.map((meta) => rows.find((r) => r.city === meta.id)).filter((r) => r !== undefined))
        .join("rect")
        .attr("class", "bar")
        .attr("y", (d) => yCity(d.city) ?? 0)
        .attr("height", yCity.bandwidth())
        .attr("x", 0)
        .attr("width", (d) => xShare(d.share))
        .attr("fill", (d) => resolveCssColor(CITY_ORDER.find((c) => c.id === d.city)!.accentVar))
        .attr("opacity", (d) => barOpacity(category, d.city))
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
        .attr("font-size", isNarrow ? 10 : 11)
        .attr("fill", mutedColor)
        .attr("opacity", (d) => barOpacity(category, d.city))
        .text((d) => `${d.share.toFixed(1)}%`);
    }
  }, [categoryTrends, cityTotals, width, selectedCategory, selectedCity, toggleCategory]);

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
