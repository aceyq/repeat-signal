# frontend/

Next.js (App Router, TypeScript) + Tailwind CSS v4 application. Serves the interactive documentary-style site; reads all its data from `../backend`'s API, never queries the database directly.

## Design system

- **Dark-first, editorial palette** — the site defaults to dark mode (the "documentary" reading experience the project is going for), with a full light-mode toggle for accessibility/preference (`components/theme-toggle.tsx`, powered by `next-themes`).
- **Typography**: [Fraunces](https://fonts.google.com/specimen/Fraunces) (a warm, editorial serif) for headlines, [Inter](https://fonts.google.com/specimen/Inter) for body/UI text. Both self-hosted via `next/font/google` — no external font requests at runtime.
- **Color tokens** live in `app/globals.css` as CSS custom properties (Tailwind v4's CSS-first `@theme` config, not a `tailwind.config.js`). Each city has its own accent hue (`accent-chicago`, `accent-nyc`, `accent-sf`) used consistently across every chart and map in later milestones.
- Dark mode is class-based (`@custom-variant dark (&:where(.dark, .dark *))`), toggled by `next-themes` setting a `.dark` class on `<html>` — not just `prefers-color-scheme` — so the toggle button actually works regardless of OS setting.

## Running locally

Requires the backend running (see `../backend/README.md`) — the homepage does a live server-side fetch to `/api/summary`.

```bash
cd frontend
npm install
cp .env.local.example .env.local   # adjust NEXT_PUBLIC_API_BASE_URL if needed
npm run dev
```

Visit `http://localhost:3000`.

## Structure

```
frontend/
├── app/
│   ├── layout.tsx       # fonts, ThemeProvider, header/footer shell
│   ├── page.tsx          # homepage: the full narrative arc (Milestones 5-8)
│   └── globals.css       # design tokens (Tailwind v4 @theme)
├── components/
│   ├── site-header.tsx, site-footer.tsx, theme-provider.tsx, theme-toggle.tsx
│   ├── sections/          # homepage narrative beats (hero, premise, stats, limits, map, trends, case studies, closing)
│   ├── charts/             # D3 charts + shared city-color legend
│   ├── cards/               # case-study-card.tsx
│   └── ui/                 # reusable primitives (reveal-on-scroll, animated count-up, ambient background)
├── hooks/
│   └── use-chart-width.ts  # ResizeObserver-based responsive sizing for D3 charts
└── lib/
    ├── api.ts             # typed fetch client for the backend
    ├── types.ts           # mirrors backend/app/schemas.py
    ├── map-config.ts      # basemap style URLs, per-city accent metadata
    ├── color-utils.ts     # hex -> rgba and CSS-variable resolution (map + charts)
    ├── geo-utils.ts       # GeoJSON bounding-box helper (avoids a full turf.js dependency)
    ├── format.ts          # category label formatting for chart axes
    └── case-studies.ts    # the 3 case studies (Milestone 8) -- see docs/CASE_STUDIES.md for sourcing
```

## Scrollytelling implementation notes (Milestone 5)

- **Narrative reveals** (`components/ui/reveal.tsx`) use Framer Motion's `whileInView` with `once: true` — simple, robust, and standard for this kind of site. No scroll-linked pinning/scrubbing for the narrative text; that's reserved for the hero's parallax fade only (`components/sections/hero-section.tsx`, via `useScroll`/`useTransform`).
- **Count-up numbers** (`components/ui/animated-number.tsx`) intentionally do **not** use Framer Motion's `animate()` + `useMotionValue` combo — an earlier version built that way silently never completed the animation on real (non-instant) scroll in testing, only appearing to work under artificial `scrollIntoView` jumps. Replaced with a plain `IntersectionObserver` + `requestAnimationFrame` tween, which is simple enough to fully reason about and was verified correct via a scripted Playwright scroll-through (dark mode, light mode, and mobile viewport) before considering this milestone done.
- All animated components respect `prefers-reduced-motion` (via Framer Motion's `useReducedMotion`), checked from the start rather than bolted on later — full accessibility audit is still Milestone 9.
- The ambient hero background (`components/ui/signal-field.tsx`) uses a seeded pseudo-random generator (not `Math.random()`) so server and client render the same dot layout — avoids a hydration mismatch.

## Map implementation notes (Milestone 6)

`components/sections/map-section.tsx` is a pinned/sticky MapLibre map inside a tall (300vh) scroll container — as the user scrolls, `useScroll`/`useMotionValueEvent` compute which of the three cities is "active," and the map flies to that city's bounds and recolors its neighborhoods as a choropleth (fill intensity driven by incident count, colored with that city's accent hue). Basemap tiles come from [OpenFreeMap](https://openfreemap.org/) — free, tokenless vector tiles, consistent with why MapLibre (not Mapbox GL) was chosen in the first place (see `docs/ARCHITECTURE.md`); it also ships a real dark-mode style, so the map swaps basemaps to match the site's theme toggle, not just the choropleth colors.

Real bugs came up building this, all worth knowing if you touch this component again:

1. **MapLibre overrides the container's `position` style via inline JS** (sets it to `relative` so it can position its own internal canvas layers), which silently broke our Tailwind `absolute inset-0` sizing class on the same element — the container rendered at zero height and nothing appeared. Fixed by wrapping in an extra `absolute inset-0` div and giving MapLibre a plain `h-full w-full` div as its actual container, never the positioned one.
2. **Negative z-index on the map container escaped its intended stacking context** and rendered behind unrelated sibling sections instead of just behind the text overlay in front of it. Fixed by keeping the map at normal stack order and giving the overlay content `relative z-10` instead of pushing the map to `-z-10` — elevate the foreground, don't bury the background.
3. **The choropleth fill was added with no `beforeId`**, so it stacked above the basemap's own text labels (street/place names), making them nearly unreadable through the tint — reported by the user as "the text cannot be read at all." Fixed by finding the style's first `symbol`-type layer at render time and passing its id as `addLayer`'s second argument, so our fill sits below all label layers.
4. **MapLibre's popup CSS hardcodes a white background but never sets a text color** (`maplibre-gl.css`'s `.maplibregl-popup-content` sets `background:#fff` only), so it inherited our page's `--foreground` variable — dark text on white in light mode (fine), but light/cream text on white in dark mode (illegible) — also reported by the user. Fixed with explicit overrides in `globals.css` using our own `--surface`/`--foreground`/`--border` tokens (with `!important`, since these need to reliably beat maplibre-gl.css regardless of stylesheet load order), so the popup matches the current theme instead of always being a plain white box.

Bugs 1 and 2 were caught by actually looking at Playwright screenshots rather than trusting "no console errors" — the map failed silently in both cases. Bugs 3 and 4 were both real contrast/legibility issues that passed every automated check (build, lint, no console errors) and were only caught because a human actually looked at the rendered map.

Neighborhood GeoJSON is fetched per city on demand (`GET /api/neighborhoods/geojson?city=`) and cached in a ref, not fetched all at once — see `backend/README.md` for why (payload size).

## Chart implementation notes (Milestone 7)

`components/charts/monthly-trend-chart.tsx` and `category-comparison-chart.tsx` use the classic "D3 controls the SVG imperatively" pattern: a `useEffect` keyed on data/width does a full `svg.selectAll("*").remove()` then redraws from scratch with real D3 (`d3.scaleTime`/`scaleLinear`/`scaleBand`, `d3.line`, `d3.axisBottom`/`axisLeft`, `d3.bisector` for the line chart's hover). Chart width is responsive via a small `useChartWidth` hook (`hooks/use-chart-width.ts`, `ResizeObserver`-based) rather than a fixed size. Colors are resolved from our CSS custom properties at render time (`lib/color-utils.ts`'s `resolveCssColor`) so the charts automatically follow the current theme and each city's consistent accent color.

The category chart shows each category as a **share of that city's own total incidents**, not raw counts — New York's volume alone would otherwise make Chicago and San Francisco's bars invisible by comparison. The share calculation happens in the component (`incident_count / cityTotal`), not the API, so the math stays visible to whoever reads the code next.

**A real data-integrity bug came up building the time-series chart:** San Francisco's most recent month sat at ~430 incidents against a normal month of ~7,500-8,000 — not a real one-month 96% drop in incidents, just the pipeline having been pulled a few days into that month, before it had a chance to be complete. Displayed as-is, it would have shown a misleading cliff at the end of the line. Fixed at the API level (`backend/app/routers/trends.py`'s `get_monthly_trends`, excludes any `year_month >= date.today().replace(day=1)`) rather than in the chart, since any consumer of that endpoint should get the same honest behavior — a monthly time series should only ever plot fully-elapsed months.

**User-reported bug, fixed post-milestone:** the category chart's row labels were right-aligned within a fixed left margin, and a long label ("Criminal damage vandalism") overflowed past the SVG's left edge and got clipped mid-word. Fixed with a proper D3 text-wrap helper (`wrapLabel` in `category-comparison-chart.tsx`) that wraps any label onto as many lines as it needs to fit the available width, then re-centers the whole block vertically on its row — a general fix that works for any label length, not a one-off patch for this specific category. Note the subtlety in that function: SVG `<tspan>` `dy` offsets are cumulative relative to the *previous* tspan, not all relative to the parent `<text>` element, so only the first line gets the full vertical-centering offset and every following line just adds one more line-height step.

## Polish pass notes (Milestone 9)

- **Contrast:** verified every design-token color pair against WCAG AA programmatically rather than eyeballing it. Light mode's `--accent-chicago` (3.45:1 against `--surface`) and `--accent-nyc` (4.51:1, right at the edge) failed or barely cleared the 4.5:1 threshold required for normal-size text — they were fine as *graphical* fills (map choropleth, chart bars only need 3:1) but not as the small text used for city labels. Darkened both in `app/globals.css` (dark mode's accents already passed at 6.28:1+, untouched).
- **Reduced motion:** every animated component now checks `useReducedMotion()` — this wasn't previously true for `Reveal` (the single most-used animation wrapper on the site), the hero's individual entrance animations, the ambient `SignalField`'s pulsing dots (an SVG SMIL `<animate>`, disabled via conditional rendering rather than a prop), and the map's `fitBounds` fly-to transitions (checked via `window.matchMedia` directly, since `renderCity` is a plain function, not a component that can call a hook).
- **Responsive:** the category comparison chart's fixed 168px left margin (for row labels) was proportionate on desktop but ate ~43% of a 390px mobile screen, leaving the bars themselves cramped. `getMargin(width)` now scales the margins and label font size down below a 480px breakpoint.
- **Performance:** `components/sections/map-section-lazy.tsx`, `components/charts/monthly-trend-chart-lazy.tsx`, and `category-comparison-chart-lazy.tsx` wrap their real components in `next/dynamic(..., { ssr: false })`, deferring maplibre-gl (~1.1MB minified, confirmed via `.next/static/chunks/` size inspection) and the D3 charts' JS until they're actually needed, rather than bundling them with the hero/above-the-fold content. Note: `ssr: false` is only allowed inside a Client Component in the App Router — since `app/page.tsx` and `trends-section.tsx` are Server Components (the former does the data fetching), the dynamic import has to live in a small `"use client"` wrapper file that the Server Component then imports normally, rather than calling `dynamic()` directly.
- **Cold-start loading state:** `app/loading.tsx` + `components/ui/loading-screen.tsx`. Next.js automatically wraps a route's async Server Component in a Suspense boundary using `loading.tsx` as the fallback — exactly what's needed once Milestone 10 deploys the backend to Render's free tier (cold starts after ~15min idle, see `docs/ARCHITECTURE.md`). Verified this actually triggers by adding a temporary `time.sleep(4)` to the backend's `/api/summary` endpoint, confirming the loading screen appeared and then handed off to the real page, then removing it — a plain code read wouldn't have caught that a browser-level network delay (e.g. Playwright's `route()` interception) can't simulate this at all, since the fetch happens server-side in the Next.js process, not in the browser.

## Pictogram (isotype) visualizations

`components/ui/pictogram-grid.tsx` — user feedback after seeing Milestones 5-9 was that the site was "just graphs," and specifically asked for stats like "1 in 30" to be shown as an actual crowd of people with the affected fraction highlighted, isotype-style. Two are live:

1. **Chicago's domestic-flag rate** (`stats-section.tsx`) — required a small backend addition (`chicago_domestic_flag_count` added to `CityOut`/`/api/cities` and `/api/summary`, null for nyc/sf) since the frontend didn't previously have this figure available at the granularity needed; 20 icons, ~4 highlighted, tied to the exact 18.9% figure already documented in `docs/PIPELINE.md`.
2. **Illinois's county review-board rate** (in the Chicago case study card) — 102 icons, 7 highlighted, directly visualizing a fact already stated in that card's cited text (`lib/case-studies.ts`'s new optional `pictogram` field).

Every pictogram traces back to an exact, sourced count — never a rounded illustration invented for effect. Icons fade/scale in on scroll (fast, small stagger, all starting muted), then the highlighted subset transitions to its accent color in its own slower stagger about half a second later, so the "counting through the crowd, some light up" effect reads clearly. Colors are resolved from CSS custom properties in an effect (not a lazy `useState` initializer) since `getComputedStyle` needs `document`, which doesn't exist during SSR — this is one of the few places in the codebase with a justified `eslint-disable` for `react-hooks/set-state-in-effect`, since (unlike the same-looking pattern removed from `theme-toggle.tsx` in Milestone 4) there's no SSR-safe alternative here.

**On the "911 call audio" idea also raised in this feedback round:** deliberately not built. Real 911 recordings, even where technically public record, capture real people's real trauma, and fabricating a realistic-sounding fake call would misrepresent a real kind of event. Flagged this directly rather than building around it silently; an abstract pulse/signal animation (no real or fake audio) was proposed as the responsible alternative for the "make it feel urgent" goal, not yet built as of this commit.

## A note on Next.js 16

This project uses Next.js 16, which shipped after this assistant's training cutoff with real breaking changes (Turbopack on by default, fully-async `params`/`searchParams`, opt-in Cache Components/PPR). Before writing App Router code here, check `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` (bundled with the installed package) rather than assuming older Next.js conventions still apply.

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build + type check
npm run lint     # ESLint
```
