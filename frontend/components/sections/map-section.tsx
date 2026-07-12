"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { FilterChip } from "@/components/ui/filter-chip";
import { CITY_ORDER, MAP_STYLE_DARK, MAP_STYLE_LIGHT } from "@/lib/map-config";
import { resolveCssColor, rgba } from "@/lib/color-utils";
import { computeBBox } from "@/lib/geo-utils";
import { useFilter } from "@/lib/filter-context";
import { formatCategoryLabel } from "@/lib/format";
import type { City } from "@/lib/types";

const SOURCE_ID = "neighborhoods";
const FILL_LAYER_ID = "neighborhoods-fill";

function cacheKeyFor(city: City, category: string | null) {
  return `${city}:${category ?? "all"}`;
}

async function fetchCityGeoJson(city: City, category: string | null): Promise<GeoJSON.FeatureCollection> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  const url = new URL("/api/neighborhoods/geojson", base);
  url.searchParams.set("city", city);
  if (category) url.searchParams.set("category", category);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${city} neighborhoods: ${response.status}`);
  return response.json();
}

function renderCity(
  map: maplibregl.Map,
  popup: maplibregl.Popup,
  city: City,
  geojson: GeoJSON.FeatureCollection | undefined,
  skipFlyTo: boolean,
) {
  if (!geojson) return;
  const meta = CITY_ORDER.find((c) => c.id === city)!;
  const accentHex = resolveCssColor(meta.accentVar);
  const maxCount = Math.max(1, ...geojson.features.map((f) => f.properties?.incident_count ?? 0));

  const existingSource = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (existingSource) {
    existingSource.setData(geojson);
  } else {
    map.addSource(SOURCE_ID, { type: "geojson", data: geojson });
    // Insert below the basemap's own text labels (symbol layers) -- added with no
    // `beforeId`, our fill would stack on top of everything, including street/place
    // names, making them unreadable through the tint. Every OpenFreeMap style
    // (light and dark) puts labels last, so this keeps them legible above us.
    const firstLabelLayerId = map.getStyle()?.layers?.find((l) => l.type === "symbol")?.id;
    map.addLayer(
      {
        id: FILL_LAYER_ID,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": "#888",
          "fill-opacity": 1,
          "fill-outline-color": "#888",
          // Density recolors on every city switch and category filter change --
          // transitioning it rather than snapping instantly is what makes the
          // choropleth read as "incidents fading in" instead of a hard cut.
          "fill-color-transition": { duration: 700 },
          "fill-outline-color-transition": { duration: 700 },
          // Also used for the one-time "single neighborhood, then the whole
          // city" intro reveal below -- transitioning opacity the same way
          // color already does.
          "fill-opacity-transition": { duration: 900 },
        },
      },
      firstLabelLayerId,
    );

    map.on("mousemove", FILL_LAYER_ID, (e) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = e.features?.[0];
      if (!feature) return;
      const { name, incident_count } = feature.properties as { name: string; incident_count: number };
      popup
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${name}</strong><br/>${incident_count.toLocaleString()} incidents (2yr window)`)
        .addTo(map);
    });
    map.on("mouseleave", FILL_LAYER_ID, () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
  }

  map.setPaintProperty(FILL_LAYER_ID, "fill-color", [
    "interpolate",
    ["linear"],
    ["get", "incident_count"],
    0,
    rgba(accentHex, 0.08),
    maxCount,
    rgba(accentHex, 0.85),
  ]);
  map.setPaintProperty(FILL_LAYER_ID, "fill-outline-color", rgba(accentHex, 0.6));

  if (!skipFlyTo) {
    const bbox = computeBBox(geojson);
    if (bbox) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map.fitBounds(bbox, { padding: 48, duration: prefersReducedMotion ? 0 : 900, essential: true });
    }
  }
}

export function MapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const cache = useRef<Record<string, GeoJSON.FeatureCollection>>({});
  const activeCityRef = useRef<City>(CITY_ORDER[0].id);
  const activeCacheKeyRef = useRef<string>(cacheKeyFor(CITY_ORDER[0].id, null));
  const lastFlownCityRef = useRef<City | null>(null);
  const currentStyleUrlRef = useRef<string | null>(null);
  const introRevealDoneRef = useRef(false);

  const { resolvedTheme } = useTheme();
  const { selectedCategory, toggleCategory } = useFilter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  // Set only during the very first paint of the very first city: names the
  // single most-reported neighborhood so the map can start on it alone
  // before broadening into the full choropleth (see the effect below). Null
  // once that one-time reveal has finished or was skipped (reduced motion).
  const [introTop, setIntroTop] = useState<{ name: string; count: number } | null>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const index = Math.min(CITY_ORDER.length - 1, Math.max(0, Math.floor(progress * CITY_ORDER.length)));
    setActiveIndex((current) => (current === index ? current : index));
  });

  // Initialize the map once.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const isDark = resolvedTheme === "dark";
    const initialStyle = isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;
    currentStyleUrlRef.current = initialStyle;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [-95, 40],
      zoom: 3,
      attributionControl: { compact: true },
    });
    map.scrollZoom.disable();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

    map.on("load", () => {
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only ever run once; theme swap handled below
  }, []);

  // Swap the base style when the theme changes (after the initial mount).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const isDark = resolvedTheme === "dark";
    const nextStyle = isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;
    if (currentStyleUrlRef.current === nextStyle) return; // avoid redundant reload on first paint
    currentStyleUrlRef.current = nextStyle;

    map.once("styledata", () => {
      if (popupRef.current) {
        renderCity(map, popupRef.current, activeCityRef.current, cache.current[activeCacheKeyRef.current], true);
      }
    });
    map.setStyle(nextStyle);
  }, [resolvedTheme, mapReady]);

  // Fetch + render whichever city is active as the user scrolls, or whichever
  // category is selected (Milestone 9.5 follow-up: click a category below to
  // filter this choropleth too). Only fly the camera when the city itself
  // changes -- a category change just recolors the same neighborhoods.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const city = CITY_ORDER[activeIndex].id;
    activeCityRef.current = city;
    const key = cacheKeyFor(city, selectedCategory);
    const isVeryFirstPaint = !introRevealDoneRef.current && lastFlownCityRef.current === null;

    let cancelled = false;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      if (!cache.current[key]) {
        cache.current[key] = await fetchCityGeoJson(city, selectedCategory);
      }
      if (cancelled || !popupRef.current) return;
      const geojson = cache.current[key];
      const skipFlyTo = lastFlownCityRef.current === city;
      renderCity(map, popupRef.current, city, geojson, skipFlyTo);
      lastFlownCityRef.current = city;
      activeCacheKeyRef.current = key;

      // One-time entrance, the first time this chapter's map ever paints:
      // isolate the single most-reported neighborhood before broadening into
      // the full choropleth -- "one neighborhood" before "the whole city,"
      // using a real count from the actual data rather than a fabricated
      // "here's one incident" pin (this dataset has no exact address to
      // point to responsibly).
      if (isVeryFirstPaint) {
        introRevealDoneRef.current = true;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const top = geojson.features.reduce((a, b) =>
          (a.properties?.incident_count ?? 0) >= (b.properties?.incident_count ?? 0) ? a : b,
        );
        const topId = top?.properties?.id as string | number | undefined;
        const topName = top?.properties?.name as string | undefined;
        const topCount = top?.properties?.incident_count as number | undefined;
        if (topId !== undefined && topName && topCount !== undefined && !prefersReducedMotion) {
          setIntroTop({ name: topName, count: topCount });
          map.setPaintProperty(FILL_LAYER_ID, "fill-opacity", ["case", ["==", ["get", "id"], topId], 1, 0.04]);
          revealTimer = setTimeout(() => {
            map.setPaintProperty(FILL_LAYER_ID, "fill-opacity", 1);
            setIntroTop(null);
          }, 2200);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, [activeIndex, mapReady, selectedCategory]);

  return (
    <section id="chapter-3" ref={sectionRef} className="relative" style={{ height: `${CITY_ORDER.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-background">
        {/* MapLibre sets `position: relative` on whatever container it's given (an
            inline style, so it overrides Tailwind's `absolute` class) -- an extra
            wrapper keeps our own "fill the sticky parent" sizing intact regardless. */}
        <div className="absolute inset-0">
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>

        <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-6 pt-16">
          <div className="inline-block rounded-lg bg-background/80 px-4 py-3 backdrop-blur">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Chapter 03 &middot; The City</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-2 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
                {CITY_ORDER[activeIndex].label}
              </h2>
            </Reveal>
            <div className="relative mt-2 max-w-sm text-sm text-muted">
              <AnimatePresence mode="wait">
                {introTop ? (
                  <motion.p
                    key="intro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    One neighborhood, {introTop.name}, carried {introTop.count.toLocaleString()} reports &mdash; more
                    than anywhere else here in two years.
                  </motion.p>
                ) : (
                  <motion.p
                    key="full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    Every neighborhood, shaded the same way, by how often it appears in two years of reports.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {selectedCategory && (
              <div className="pointer-events-auto mt-3">
                <FilterChip
                  label={`Filtered to: ${formatCategoryLabel(selectedCategory)}`}
                  onClear={() => toggleCategory(selectedCategory)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-none relative z-10 mt-auto flex justify-center gap-3 pb-10">
          {CITY_ORDER.map((city, i) => (
            <div
              key={city.id}
              className="h-1.5 w-8 rounded-full transition-colors"
              style={{
                backgroundColor: i === activeIndex ? `var(${city.accentVar})` : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
