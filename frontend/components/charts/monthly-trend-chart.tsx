"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useChartWidth } from "@/hooks/use-chart-width";
import { CITY_ORDER } from "@/lib/map-config";
import { resolveCssColor } from "@/lib/color-utils";
import type { MonthlyTrend } from "@/lib/types";

const MARGIN = { top: 16, right: 16, bottom: 28, left: 48 };
const HEIGHT = 360;

export function MonthlyTrendChart({ data }: { data: MonthlyTrend[] }) {
  const { ref: containerRef, width } = useChartWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || width === 0 || data.length === 0) return;

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", HEIGHT).attr("viewBox", `0 0 ${width} ${HEIGHT}`);

    const mutedColor = resolveCssColor("--muted");
    const borderColor = resolveCssColor("--border");
    const foregroundColor = resolveCssColor("--foreground");
    const surfaceColor = resolveCssColor("--surface");

    const parsed = data.map((d) => ({ ...d, date: new Date(d.year_month) }));
    const byCity = d3.group(parsed, (d) => d.city);
    const allMonths = Array.from(new Set(parsed.map((d) => +d.date))).sort((a, b) => a - b);

    const x = d3.scaleTime().domain(d3.extent(parsed, (d) => d.date) as [Date, Date]).range([0, innerWidth]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(parsed, (d) => d.incident_count) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Gridlines (horizontal only -- a light reference, not a full grid)
    g.append("g")
      .attr("stroke", borderColor)
      .attr("stroke-opacity", 0.6)
      .call((gridG) =>
        gridG
          .selectAll("line")
          .data(y.ticks(5))
          .join("line")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", (d) => y(d))
          .attr("y2", (d) => y(d)),
      );

    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(3)).tickFormat(d3.timeFormat("%b '%y") as never).tickSizeOuter(0));
    const yAxis = g.append("g").call(d3.axisLeft(y).ticks(5));
    for (const axis of [xAxis, yAxis]) {
      axis.selectAll("text").attr("fill", mutedColor).attr("font-size", 12);
      axis.selectAll("line, path").attr("stroke", borderColor);
    }

    const line = d3
      .line<(typeof parsed)[number]>()
      .x((d) => x(d.date))
      .y((d) => y(d.incident_count))
      .curve(d3.curveMonotoneX);

    for (const meta of CITY_ORDER) {
      const cityData = (byCity.get(meta.id) ?? []).sort((a, b) => +a.date - +b.date);
      if (cityData.length === 0) continue;
      const color = resolveCssColor(meta.accentVar);

      g.append("path")
        .datum(cityData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("d", line);
    }

    // Hover: vertical guideline + a dot per city + a small tooltip box, all D3-managed
    // (no React state) so mousemove doesn't trigger re-renders.
    const bisect = d3.bisector((d: number) => d).center;
    const focus = g.append("g").style("display", "none");
    const focusLine = focus
      .append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", mutedColor)
      .attr("stroke-dasharray", "3,3");
    const focusDots = CITY_ORDER.map((meta) =>
      focus.append("circle").attr("r", 4).attr("fill", resolveCssColor(meta.accentVar)),
    );
    const tooltip = focus.append("g");
    const tooltipRect = tooltip
      .append("rect")
      .attr("fill", surfaceColor)
      .attr("stroke", borderColor)
      .attr("rx", 6);
    const tooltipText = CITY_ORDER.map((_, i) =>
      tooltip
        .append("text")
        .attr("font-size", 12)
        .attr("fill", foregroundColor)
        .attr("y", 16 + i * 16),
    );

    svg
      .append("rect")
      .attr("x", MARGIN.left)
      .attr("y", MARGIN.top)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .on("mouseenter", () => focus.style("display", null))
      .on("mouseleave", () => focus.style("display", "none"))
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const monthIndex = bisect(allMonths, +x.invert(mx));
        const month = allMonths[monthIndex];
        if (month === undefined) return;
        focusLine.attr("x1", x(month)).attr("x2", x(month));

        let maxTooltipWidth = 0;
        CITY_ORDER.forEach((meta, i) => {
          const point = (byCity.get(meta.id) ?? []).find((d) => +d.date === month);
          focusDots[i].attr("cx", x(month)).attr("cy", point ? y(point.incident_count) : -100);
          const label = `${meta.label}: ${point ? point.incident_count.toLocaleString() : "—"}`;
          tooltipText[i].text(label);
          maxTooltipWidth = Math.max(maxTooltipWidth, (tooltipText[i].node()?.getComputedTextLength() ?? 0));
        });

        const tooltipX = x(month) + 12 + maxTooltipWidth + 16 > innerWidth ? x(month) - maxTooltipWidth - 28 : x(month) + 12;
        tooltip.attr("transform", `translate(${tooltipX}, 8)`);
        tooltipRect.attr("width", maxTooltipWidth + 16).attr("height", CITY_ORDER.length * 16 + 8);
        tooltipText.forEach((t) => t.attr("x", 8));
      });
  }, [data, width]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} role="img" aria-label="Monthly incident counts by city over time" />
    </div>
  );
}
