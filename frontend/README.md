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
│   ├── sections/          # homepage narrative beats: call-chapter.tsx (opening), premise, stats, limits, map, trends, case studies, closing
│   ├── dispatch/           # reusable dispatch-console primitives (badge, waveform, timer, transcript) -- see below
│   ├── charts/             # D3 charts + shared city-color legend
│   ├── cards/               # case-study-card.tsx
│   └── ui/                 # reusable primitives (reveal-on-scroll, animated count-up, scene-atmosphere.tsx)
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

## Chapter 1: The Call (opening dispatch sequence)

The homepage's opening replaced the earlier hero/intro-overlay/pulse setup (Milestones 5 and 9.5) with a single cinematic chapter, `components/sections/call-chapter.tsx`, built from user direction to open like "an active emergency dispatch center" rather than a typical hero banner:

1. **Cold open** — the screen starts black, a soft glow fades in ~800ms later revealing a dispatch console: a `DispatchBadge` ("911 · Call in progress"), an organic-feeling `CallWaveform` (40 bars, each with its own seeded amplitude envelope and loop timing — not a uniform equalizer), a live-ticking `CallTimer`, and a `CallTranscript` that reveals three illustrative dispatch lines a few seconds apart.
2. **First scroll** — scrolling shrinks and fades the console, then reveals three large typographic statements one at a time ("Every emergency call begins with someone asking for help." → "Some calls receive help immediately. Others don't." → "Every second matters."), pinned within a 450vh scroll section.
3. **Visual language** — `components/ui/scene-atmosphere.tsx` layers a cursor-following spotlight, a vignette, and film grain (all pure CSS, no image assets, same "no external asset dependency" philosophy as `signal-field.tsx`). The vignette/spotlight are dark-mode only (`dark:` variants) — a black-edged vignette against light mode's cream background read as a muddy smear rather than cinematic depth once actually seen in light mode, caught by testing both themes rather than assuming dark-mode styling would just carry over.

All the dispatch primitives (`components/dispatch/`) are built as standalone, reusable pieces — not because this pass needs them elsewhere yet, but because later chapters (see the roadmap's chapter-system notes) are expected to reuse the same dispatch-console visual language.

**On the transcript content, and why it changed again:** the first version used an illustrative, invented line ("Caller: I don't think he's breathing."), captioned as reconstructed/not real. The user then asked for a *real* transcript, specifically requesting a case where police didn't respond promptly — that's a materially different and riskier ask than what came before: searching for "a case where police failed" to fit a dramatic opening is choosing a story to match a predetermined narrative, which is exactly what `docs/ETHICS.md` and this project's own case-study selection process (see `docs/CASE_STUDIES.md`: cases chosen for how well-documented they are, explicitly *not* for how damning they are) exist to prevent. Raised that directly rather than searching on request, and it turned out unnecessary to search at all: the SF case study, already fully sourced since Milestone 8, is a City-published Domestic Violence Death Review Team report specifically about "dispatch handling of repeat calls" and directly quotes "multiple responses to the victim's address."

**Then the user pushed back again**, three times, on the result. First: the finding-as-quote ("multiple responses to the victim's address") wasn't dialogue, and they specifically wanted "a preview of what was said during that 911 call" — asked to research further rather than settle for a paraphrase. Reading the DVDRT PDF directly (not a search-engine summary — `WebFetch` initially failed to parse this specific PDF's text layer, worked once the file was saved locally and read with the `Read` tool instead) turned up something better: the report's Chronology of Events section directly quotes the caller's own words from her 10:10pm call (her fourth of six that night), transcribed verbatim including a natural speech filler ("um") that confirms it's pulled straight from the call record, not paraphrased.

Second pushback: with just that one quote, the scene didn't read as "a conversation" — fair, since it was one line of framing text plus one quote. The honest constraint: the DVDRT report contains exactly one verbatim excerpt from the actual call; everything else in it is the reviewers' own paraphrase. Building a real back-and-forth would mean inventing the dispatcher's half, recreating the exact fabrication problem already ruled out earlier. Instead, `CALL_TRANSCRIPT` in `call-transcript.tsx` now uses four separately-cited facts from the same report to build an actual arc — how many times she called (six), her real words on one of those calls, how many times police came (three), and that it didn't stop what happened — rather than one quote floating alone. Caught and fixed a real sourcing error while rewriting this: an earlier version of this note called the 10:10pm call her "third" that night; the report explicitly labels the *9:33pm* call as her third, making 10:10pm her fourth. Worth flagging as a reminder that even careful primary-source reading needs a second pass on anything involving a count.

`components/dispatch/call-transcript.tsx`'s real content is sourced in `docs/CASE_STUDIES.md`, traced to the same primary-source PDF as the case study card. Two things keep this honest: (1) the one verbatim line is rendered as an attributed quotation, labeled as her own words from the call, not attached to a fake "Caller"/"Dispatcher" exchange, and (2) the citation underneath links to `#case-study-sf`, jumping straight to the full, contextualized case study card further down the page (`case-study-card.tsx` now has a stable anchor `id` for this). The badge/waveform/timer above stay abstract and generic — they represent the concept of "a 911 call," true of any of the ~1.65M incidents in this project, not a claim that they're literally replaying *that* 2014 call's audio.

The same feedback round also flagged that the whole cold-open felt too slow — mostly a bare timer before any text landed. Tightened `GLOW_FADE_START`/`BADGE_DELAY`/`WAVEFORM_DELAY`/`TIMER_DELAY` in `call-chapter.tsx` and the transcript's own timing so the full sequence, badge through the real quote, now resolves in about 5 seconds instead of roughly 12.

**A real, time-consuming bug worth documenting:** the original implementation drove the shrink/fade transition with `useTransform(scrollYProgress, [a, b], [1, 0])` bound directly via `style={{ opacity, scale, y }}` on a `motion.div` — the same pattern that worked fine in the old `hero-section.tsx`. Here it didn't: the underlying `MotionValue` read back correctly everywhere it was checked (`.get()`, a live on-screen debug readout), but the actual painted DOM element's `getComputedStyle().opacity` diverged from it and never reliably reached 0, so scroll-away content kept visibly overlapping the incoming statement text. Bisected by stripping the JSX down to a single hardcoded `style={{opacity: 0.05}}` div (confirmed real hardcoded opacity paints correctly) and then reintroducing the scroll-driven value (confirmed broken again) — isolated to something specific about this combination (a tall `offset: ["start start", "end end"]` pinned section, several simultaneous `useTransform` outputs on one style object) rather than `useTransform` in general. Rather than chase the exact root cause further, rewrote the transition to compute the same piecewise-linear/clamped math **imperatively** inside `useMotionValueEvent(scrollYProgress, "change", ...)`, calling `.set()` on plain `useMotionValue()`s — the same architectural pattern `map-section.tsx` already uses successfully to derive its active-city index from scroll. Confirmed fixed via the same bisection screenshots, both dev and production builds.

## Chapter 2: The Response

`components/sections/response-chapter.tsx` — a real, cited animated timeline continuing directly from Chapter 1: the same San Francisco case, laid out minute by minute (six 911 calls, three police visits, an ~4-hour custody hold, the outcome), each row a `Reveal`-based whole-row fade-in rather than a new custom scroll mechanism (deliberately reusing the simplest, already-proven pattern in this codebase after Chapter 1's `useTransform` bug — a sequential list doesn't need pinned scroll-scrubbing).

**Why this chapter isn't "response-time statistics" as originally briefed:** none of the three cities' incident-level datasets include a response-time or dispatch-arrival field (checked against `docs/DATA_DICTIONARY.md` before starting) — there's no real "how long did it take police to arrive" number anywhere in this project's data, aggregate or otherwise. Flagged this before building anything, since inventing dataset-wide response-time stats to match the brief would mean fabricating numbers the data doesn't support. What the primary source *does* support is the full, exact timeline of one well-documented real case — which delivers "animated timeline... delays" honestly, just scoped to one case rather than the whole dataset.

**A real nuance worth preserving if this chapter is ever edited:** the source material never characterizes any individual police response as slow — each of the three visits happened within minutes of a call. The actual documented failure mode is a gap in shared context *between* separate responses (the CAD system didn't carry information from one visit to the next), not response speed. The chapter's intro copy states this directly rather than implying "the police were slow," which the data doesn't support.

Every timestamp is sourced in `docs/CASE_STUDIES.md`; timestamps prefixed `~` are this project's own arithmetic from the report's relative statements ("five minutes later," "within three minutes"), not directly-quoted absolute times, and are flagged in a code comment for future editors. Caught a real sourcing error while building this: an earlier round mislabeled the 10:10pm call (reused from Chapter 1) as the caller's "third" call that night — the source explicitly labels the 9:33pm call as her third, making 10:10pm her fourth. Corrected everywhere.

**Milestone 11 update — glow, fade, tension, and honest hover context.** Extended (not replaced) the row structure above: a plain `IntersectionObserver` tracks which row the reader is currently at (same scrollspy pattern as `chapter-nav.tsx`), and that row's marker gets a soft expanding-ring glow while every already-read row fades to 35% opacity — the timeline visibly separates "already read" from "reading now" as you scroll, rather than every row looking identical regardless of position. Added a deliberate empty beat (extra top padding) before the final "Outcome" row so it doesn't arrive as just the next list item — a pause, then the loudest glow on the page, reserved for that row alone. Approximated timestamps (the `~`-prefixed ones) got a small hover affordance instead of a permanent visible caveat: hovering the marker reveals it's calculated from the source's relative time language, not directly stated. Everything here is a discrete state change (`past` / `current` / `upcoming`) animated declaratively via Framer's `animate` prop, never a `useTransform`-on-scroll value, and all of it collapses to a static non-pulsing state under `prefers-reduced-motion`.

## Other scrollytelling implementation notes (Milestone 5)

- **Narrative reveals** (`components/ui/reveal.tsx`) use Framer Motion's `whileInView` with `once: true` — simple, robust, and standard for this kind of site.
- **Count-up numbers** (`components/ui/animated-number.tsx`) intentionally do **not** use Framer Motion's `animate()` + `useMotionValue` combo — an earlier version built that way silently never completed the animation on real (non-instant) scroll in testing, only appearing to work under artificial `scrollIntoView` jumps. Replaced with a plain `IntersectionObserver` + `requestAnimationFrame` tween, which is simple enough to fully reason about and was verified correct via a scripted Playwright scroll-through (dark mode, light mode, and mobile viewport) before considering this milestone done.
- All animated components respect `prefers-reduced-motion` (via Framer Motion's `useReducedMotion`), checked from the start rather than bolted on later — full accessibility audit is still Milestone 9.
- `components/ui/signal-field.tsx` (the seeded ambient dot field, now used by `loading-screen.tsx`) uses a seeded pseudo-random generator (not `Math.random()`) so server and client render the same dot layout — avoids a hydration mismatch.

## Map implementation notes (Milestone 6)

`components/sections/map-section.tsx` is a pinned/sticky MapLibre map inside a tall (300vh) scroll container — as the user scrolls, `useScroll`/`useMotionValueEvent` compute which of the three cities is "active," and the map flies to that city's bounds and recolors its neighborhoods as a choropleth (fill intensity driven by incident count, colored with that city's accent hue). Basemap tiles come from [OpenFreeMap](https://openfreemap.org/) — free, tokenless vector tiles, consistent with why MapLibre (not Mapbox GL) was chosen in the first place (see `docs/ARCHITECTURE.md`); it also ships a real dark-mode style, so the map swaps basemaps to match the site's theme toggle, not just the choropleth colors.

Real bugs came up building this, all worth knowing if you touch this component again:

1. **MapLibre overrides the container's `position` style via inline JS** (sets it to `relative` so it can position its own internal canvas layers), which silently broke our Tailwind `absolute inset-0` sizing class on the same element — the container rendered at zero height and nothing appeared. Fixed by wrapping in an extra `absolute inset-0` div and giving MapLibre a plain `h-full w-full` div as its actual container, never the positioned one.
2. **Negative z-index on the map container escaped its intended stacking context** and rendered behind unrelated sibling sections instead of just behind the text overlay in front of it. Fixed by keeping the map at normal stack order and giving the overlay content `relative z-10` instead of pushing the map to `-z-10` — elevate the foreground, don't bury the background.
3. **The choropleth fill was added with no `beforeId`**, so it stacked above the basemap's own text labels (street/place names), making them nearly unreadable through the tint — reported by the user as "the text cannot be read at all." Fixed by finding the style's first `symbol`-type layer at render time and passing its id as `addLayer`'s second argument, so our fill sits below all label layers.
4. **MapLibre's popup CSS hardcodes a white background but never sets a text color** (`maplibre-gl.css`'s `.maplibregl-popup-content` sets `background:#fff` only), so it inherited our page's `--foreground` variable — dark text on white in light mode (fine), but light/cream text on white in dark mode (illegible) — also reported by the user. Fixed with explicit overrides in `globals.css` using our own `--surface`/`--foreground`/`--border` tokens (with `!important`, since these need to reliably beat maplibre-gl.css regardless of stylesheet load order), so the popup matches the current theme instead of always being a plain white box.

Bugs 1 and 2 were caught by actually looking at Playwright screenshots rather than trusting "no console errors" — the map failed silently in both cases. Bugs 3 and 4 were both real contrast/legibility issues that passed every automated check (build, lint, no console errors) and were only caught because a human actually looked at the rendered map.

Neighborhood GeoJSON is fetched per city on demand (`GET /api/neighborhoods/geojson?city=`) and cached in a ref, not fetched all at once — see `backend/README.md` for why (payload size).

**Became Chapter 3, "The City," without a rebuild.** This section already delivered most of what that chapter needed (fullscreen pinned interactive map, density-by-neighborhood coloring, hover-based neighborhood exploration) from Milestone 6 and the Milestone 9.5 click-to-filter follow-up, so rebuilding it from scratch would have duplicated already-tested work. Changes were targeted at the actual gaps: (1) the overlay's eyebrow now reads "Chapter 03 · The City" with a one-line intro, matching Chapters 1-2's framing, and (2) added `fill-color-transition`/`fill-outline-color-transition` (700ms) to the choropleth layer so a city switch or category filter change now fades the new density coloring in instead of snapping instantly — the literal "incidents fade in" beat from the brief. The choropleth itself stands in for "heatmaps": the data is already pre-aggregated to neighborhood polygons (not raw incident points), so a real point-density heatmap layer would be the wrong tool for this data shape — a filled-polygon choropleth is the correct visualization for regionally-aggregated counts, and is what "heatmap" means here.

## Chart implementation notes (Milestone 7)

`components/charts/monthly-trend-chart.tsx` and `category-comparison-chart.tsx` use the classic "D3 controls the SVG imperatively" pattern: a `useEffect` keyed on data/width does a full `svg.selectAll("*").remove()` then redraws from scratch with real D3 (`d3.scaleTime`/`scaleLinear`/`scaleBand`, `d3.line`, `d3.axisBottom`/`axisLeft`, `d3.bisector` for the line chart's hover). Chart width is responsive via a small `useChartWidth` hook (`hooks/use-chart-width.ts`, `ResizeObserver`-based) rather than a fixed size. Colors are resolved from our CSS custom properties at render time (`lib/color-utils.ts`'s `resolveCssColor`) so the charts automatically follow the current theme and each city's consistent accent color.

The category chart shows each category as a **share of that city's own total incidents**, not raw counts — New York's volume alone would otherwise make Chicago and San Francisco's bars invisible by comparison. The share calculation happens in the component (`incident_count / cityTotal`), not the API, so the math stays visible to whoever reads the code next.

**A real data-integrity bug came up building the time-series chart:** San Francisco's most recent month sat at ~430 incidents against a normal month of ~7,500-8,000 — not a real one-month 96% drop in incidents, just the pipeline having been pulled a few days into that month, before it had a chance to be complete. Displayed as-is, it would have shown a misleading cliff at the end of the line. Fixed at the API level (`backend/app/routers/trends.py`'s `get_monthly_trends`, excludes any `year_month >= date.today().replace(day=1)`) rather than in the chart, since any consumer of that endpoint should get the same honest behavior — a monthly time series should only ever plot fully-elapsed months.

**User-reported bug, fixed post-milestone:** the category chart's row labels were right-aligned within a fixed left margin, and a long label ("Criminal damage vandalism") overflowed past the SVG's left edge and got clipped mid-word. Fixed with a proper D3 text-wrap helper (`wrapLabel` in `category-comparison-chart.tsx`) that wraps any label onto as many lines as it needs to fit the available width, then re-centers the whole block vertically on its row — a general fix that works for any label length, not a one-off patch for this specific category. Note the subtlety in that function: SVG `<tspan>` `dy` offsets are cumulative relative to the *previous* tspan, not all relative to the parent `<text>` element, so only the first line gets the full vertical-centering offset and every following line just adds one more line-height step.

## Chapter 4: The Data

Rebranded, same reasoning as Chapter 3: both D3 charts already existed (Milestone 7) and already handled real data honestly (share-of-total, not raw counts; excluded the always-incomplete current month). The one real gap versus the brief was "every chart should animate into view" — both charts previously just snapped into their final, fully-drawn state the instant their effect ran, with no connection to scrolling at all.

Added `hooks/use-in-view-once.ts` — a plain `IntersectionObserver`-based hook (same reasoning as `ui/animated-number.tsx`: mixing Framer Motion's `whileInView` into a component whose real work is an imperative D3 redraw is exactly the kind of interaction that caused Chapter 1's scroll-linked opacity bug, so this stays simple enough to fully reason about instead). Each chart now gates its whole draw on `inView`, and tracks a `hasDrawnRef` so the "entrance" animation only plays once, ever — a later redraw triggered by a category/city filter change renders instantly, which is what you want when you're actively interacting with the chart, not waiting through the same reveal again.

- **Line chart** (`monthly-trend-chart.tsx`): the classic D3 line-draw technique — `path.getTotalLength()`, set `stroke-dasharray` to that length and `stroke-dashoffset` to the same value (so nothing shows), then transition `stroke-dashoffset` to 0 over 1400ms. All three cities' lines animate independently since they're separate paths with separate lengths.
- **Bar chart** (`category-comparison-chart.tsx`): bars grow from `width: 0` to their real share-based width over 700ms, staggered per category row (capped at 450ms max delay so the bottom rows don't wait too long), with each row's `%` labels fading in shortly after that row's bars finish growing.
- Both respect `prefers-reduced-motion` — render at final state immediately, no entrance sequence at all.

**"Never show all charts at once"** wasn't rebuilt as a new pinned-scroll mechanism (deliberately, given Chapter 1's bug with that exact pattern) — the two charts already sit far enough apart in normal document flow, each triggering its own `useInViewOnce` independently, that only one is ever the one currently animating/in-focus as you scroll past it. A future chapter-nav pass could revisit this if a more literal single-chart-at-a-time experience is wanted.

## Chapter 5: The Stories

Rebranded and extended the existing Milestone 8 case studies (`case-studies-section.tsx`, `cards/case-study-card.tsx`, `lib/case-studies.ts`) rather than rebuilding — the three real, cited cases were already there. Added what the brief asked for that was missing, only where the underlying sources actually support it:

- **Expandable cards** (`case-study-card.tsx` is now a client component with local `expanded` state): collapsed by default to a city label, a record-type badge, and the headline; click to reveal the full body, location, pictogram, timeline, and source link, animated via Framer Motion's `height: "auto"` transition. This was also the long-standing "expandable case study cards" backlog item from the Milestone 9.5 feedback round — one change did both. The section's grid now uses `items-start` so an expanded card doesn't stretch its still-collapsed neighbors' backgrounds to match its height.
- **Timelines, only where the source has one:** Chicago's card now has a real, dated timeline (`CaseStudy.timeline`) built entirely from facts already in its own body text and sourcing notes — the 2021 law, the ~6-week gap before the first killing, both killings, the protective order, and the reporting's county-review-board finding. San Francisco's card links to `#chapter-response` instead of duplicating Chapter 2's timeline a second time on the same page. **NYC's card deliberately has no timeline at all** — its source is a citywide aggregate statistic, not a single documented incident, and forcing chronological structure onto it would invent something the source doesn't have.
- **Location, only at the same granularity the project already uses everywhere else:** SF's card adds "SOMA, San Francisco" (`CaseStudy.location`), taken directly from the DVDRT report's own chronology — neighborhood-level, never a street name or address, matching the privacy standard already applied to this project's own incident data. Chicago and NYC have no location field: Chicago's source is about a statewide policy failure, not tied to one neighborhood, and NYC's is citywide.
- **Record-type badges** ("Investigative journalism" for Chicago's ProPublica piece, "Government report" for NYC and SF) — a real, sourced fact about each record, shown as a small badge rather than left implicit in the citation link.

**Deliberately not built: photographs.** The brief asks for "photographs where legally usable." There are no rights-cleared, ethically appropriate photographs of these specific real people to use here — even a photograph that's technically legally available (e.g. from a news photo or public record) of a real domestic violence victim carries a real dignity/exploitation concern that a technical licensing check doesn't resolve, and this project has consistently avoided visual or audio identification of the real people involved (SF and NYC are anonymized in the underlying sources themselves; Chicago names two people only via already-published court records and reporting, never an image). Not something to revisit without a much more specific reason than "the brief mentioned it."

**"Incident maps"** were deliberately not built as a separate embedded map per card. Chapter 3 already has a full, real, interactive neighborhood-density map for all three cities; a second, redundant map per case study card (especially at a coarser, less useful granularity) would have added weight without adding information. The location text note above is the proportionate version of this for the one card where the source supports it.

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

**On the "911 call audio" idea also raised in this feedback round:** deliberately not built. Real 911 recordings, even where technically public record, capture real people's real trauma, and fabricating a realistic-sounding fake call would misrepresent a real kind of event. Flagged this directly rather than building around it silently; an abstract pulse/signal animation (no real or fake audio) was proposed as the responsible alternative for the "make it feel urgent" goal, and is now built (see below).

Note: the icon sizes shipped in the first pass (18px default, 7px in the case study card) read as unrecognizable dots rather than people once seen live — user feedback caught this. Sizes are now 32px (`stats-section.tsx`) and 14px (`case-study-card.tsx`, where 102 icons still need to fit one card column).

## Superseded: hero pulse / intro overlay

Between the pictogram round above and Chapter 1: The Call, the opening went through two earlier versions — a small persistent pulse icon in the hero (too subtle to register as intentional, per user feedback: "I don't see the pulsing animation at all"), then a full-viewport skippable title card (`intro-overlay.tsx`) with a pulse-and-caption sequence. Both are gone now, replaced entirely by the dispatch cold-open described above, which is what the user actually wants the opening to be rather than a decoration bolted onto a conventional hero. Noted here rather than silently deleted from history, since the same lesson (default to something bigger/more literal for this project's "make an impact" asks, rather than a tasteful understatement) is still the operating one — see the project memory for the full note.

## Click-to-filter charts and map

`lib/filter-context.tsx` — a small React context (`FilterProvider`, wrapping the whole homepage from `app/page.tsx`) holding two pieces of shared state: `selectedCategory` and `selectedCity`. This turns the Milestone 6/7 charts and map from a static view into one connected tool:

- **Click a category** (a row in `CategoryComparisonChart`) — highlights that row (dims the rest), refetches `MonthlyTrendChart`'s data client-side via `api.getMonthlyTrends({ category })` (same pattern as the map's own per-city fetch), and refetches the map's choropleth via the existing `/api/neighborhoods/geojson?city=&category=` endpoint, keyed in its cache by `` `${city}:${category}` ``. The map only re-flies the camera when the city itself changes, not on a category change re-coloring the same neighborhoods.
- **Click a city** (`CityLegend`, now real buttons rather than static swatches) — isolates that city's line in `MonthlyTrendChart` and dims the others; also dims non-selected cities' bars in `CategoryComparisonChart` for consistency. Deliberately *not* wired to click-on-the-line-itself: the monthly chart already has a full-width transparent rect on top of the plot area for its hover tooltip, which would silently swallow clicks aimed at the thin line paths underneath. Real, focusable `<button>`s in the legend sidestep that entirely and are keyboard/screen-reader reachable besides.
- Both filters are toggles (click again, or the `×` on a `FilterChip`, to clear) and persist across scrolling between the map and chart sections since the context lives above both.

## Chapter 6: Explore

`components/sections/explore-chapter.tsx` — a free-form city + category browser, closing the chapter system out with something that isn't a fixed narrative beat. Pick any of the three cities and any of the ~21 shared categories (not just the top 8 already charted in Chapter 4) and see a live-fetched total plus a ranked top-8 neighborhood breakdown, over the full two-year window.

No new backend work was needed — `GET /api/aggregates?city=&category=` (already existed, used elsewhere for the raw data endpoint) returns per-neighborhood monthly rows, which this component sums client-side by neighborhood and sorts. `GET /api/categories` (also already existed) supplies the full category list for the dropdown, fetched server-side in `page.tsx` alongside the other homepage data.

**Deliberately its own, local `useState`, not the shared `FilterProvider` context Chapters 3-4 use.** Reusing that context would mean picking a category here silently re-filters the map and charts the reader has already scrolled past — confusing action-at-a-distance for what's supposed to be a self-contained sandbox, not another connected narrative piece. It also needs the full category list, not just the top 8 the shared filter state is scoped to.

The neighborhood ranking includes an "Unknown" bucket where `neighborhood_name` is null (a small number of incidents that didn't match a boundary during the Milestone 2 geospatial join) rather than silently dropping those rows — consistent with this project's general practice of surfacing data limitations instead of hiding them.

## Chapter navigator

`components/ui/chapter-nav.tsx` — the floating "CASE FILE" rail from the original brief, the last piece of the six-chapter system. Fixed to the left edge, `hidden lg:block` (a persistent side rail doesn't have room on narrow screens, and every chapter is still reachable by scrolling normally). Stays invisible until the reader scrolls past the opening beat, then fades in and highlights whichever chapter section is currently in view.

Highlighting uses a plain `IntersectionObserver` "scrollspy" — a thin detection band (`rootMargin: "-35% 0px -55% 0px"`) near the top third of the viewport; whichever chapter section intersects that band is "active." This is deliberately not a scroll-linked Framer Motion value: the nav only ever needs to know *which* chapter is current, never an exact scroll position, and Chapter 1's `useTransform` bug (see below) is reason enough to keep this mechanism as simple as possible. The active indicator itself is a small sliding bar using Framer Motion's `layoutId` shared-element animation, so it glides between list items instead of jumping.

Every chapter section carries a stable `id="chapter-N"` (Chapter 2's was renamed from `chapter-response` to match; `case-study-card.tsx`'s SF cross-link was updated accordingly), and `globals.css` adds a reduced-motion-gated `scroll-behavior: smooth` so clicking a nav entry glides to that chapter rather than snapping. Both the nav's fade-in and the indicator's slide collapse to near-instant under `prefers-reduced-motion`.

## A note on Next.js 16

This project uses Next.js 16, which shipped after this assistant's training cutoff with real breaking changes (Turbopack on by default, fully-async `params`/`searchParams`, opt-in Cache Components/PPR). Before writing App Router code here, check `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` (bundled with the installed package) rather than assuming older Next.js conventions still apply.

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build + type check
npm run lint     # ESLint
```
