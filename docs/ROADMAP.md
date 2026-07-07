# Roadmap

Built one milestone at a time. Each milestone is only started after the previous one is confirmed working.

- [x] **Milestone 0 — Architecture & repository setup**
  Vision alignment, tech stack decisions, dataset selection, repo skeleton, docs (this folder).

- [x] **Milestone 1 — Data acquisition & exploration**
  Pull raw data samples from Chicago, NYC, and SF open data APIs; verify live schemas against `docs/DATA_SOURCES.md`; exploratory notebooks; write a data dictionary for each city's raw schema. See `notebooks/01-03_*.ipynb` and `docs/DATA_DICTIONARY.md`. Key findings: Chicago has a native `domestic` flag, NYC has per-complaint demographic fields (governed by `docs/ETHICS.md`) with ~33-38% unusable/unknown race values, SF has the cleanest native neighborhood field. Cross-city "domestic-related" comparisons can't be measured identically across all three cities — a limitation to state explicitly in the site's narrative.

- [x] **Milestone 2 — Data pipeline & cross-city normalization**
  Full pipeline built in `scripts/` (fetch -> clean/normalize -> geospatial join -> aggregate), documented in `docs/PIPELINE.md`. Pulled a real 2-year window: 1,652,117 incidents across all three cities, geo-joined to 380 neighborhoods (100% match for Chicago/NYC, 95.3% for SF), normalized into a shared 21-category taxonomy, and reduced to a 98,759-row / 264KB monthly aggregate table that Milestone 3's database will actually serve.

- [x] **Milestone 3 — Database & backend API**
  PostgreSQL schema (Alembic migrations), seed script loading the pipeline's processed parquet files, FastAPI app with typed endpoints (`/api/cities`, `/api/categories`, `/api/neighborhoods`, `/api/aggregates`, `/api/summary`), 13 passing tests. Revised mid-build from the original PostGIS plan to plain Postgres with a JSON geometry column, since PostGIS required an hours-long from-source GDAL/protobuf/LLVM build on this machine's unsupported OS version and would only have bought a live spatial-query engine the project never actually uses (all spatial computation already happens offline in Milestone 2). See `docs/ARCHITECTURE.md` and `backend/README.md`.

- [x] **Milestone 4 — Frontend scaffold & design system**
  Next.js 16 (App Router, TypeScript, Tailwind v4) initialized in `frontend/`. Dark-first design system (Fraunces + Inter fonts, per-city accent colors, class-based dark mode toggle via `next-themes`), header/footer layout shell, and a typed API client (`lib/api.ts`) verified end-to-end against the live backend — the placeholder homepage renders real numbers (1,652,117 total incidents) fetched server-side from Postgres through FastAPI. Production build, lint, and a Playwright screenshot check (dark + light mode, no console errors) all pass. Public Vercel deployment deferred to Milestone 10, once there's an actual homepage worth showing.

- [x] **Milestone 5 — Homepage hero & scrollytelling intro**
  Full-viewport hero (scroll-linked parallax fade, ambient seeded dot field, per-city accent glows) followed by a four-beat scrollytelling narrative: the project's premise (responsibly reframed from its true-crime-reporting origin), the real data scale (animated count-up of the actual 1,652,117 incidents and per-city breakdown), the data's limits stated up front (not buried — ties directly to `docs/ETHICS.md`), and a closing transition into the sections still to come. Verified with a scripted Playwright scroll-through in dark mode, light mode, and a mobile viewport; caught and fixed a real bug where the count-up animation silently never completed on genuine incremental scrolling (rewritten from Framer Motion's `animate()`/`useMotionValue` to a plain `IntersectionObserver` + `requestAnimationFrame` tween). See `frontend/README.md` for implementation notes.

- [x] **Milestone 6 — Interactive map section**
  A pinned/sticky MapLibre map (free, tokenless OpenFreeMap basemaps, including a real dark style) inside a scroll-driven section: as the reader scrolls, the map flies between Chicago, NYC, and San Francisco, recoloring each city's neighborhoods as a choropleth by incident density in that city's accent color, with a hover tooltip showing exact counts. Required a new backend endpoint (`GET /api/neighborhoods/geojson`) that bundles boundaries + incident totals into one simplified-geometry payload per city (SF: 1.7MB &rarr; 33KB; NYC: 4.4MB &rarr; 198KB). Caught and fixed two real, silent rendering bugs during verification (MapLibre overriding the container's CSS position via inline styles, and a negative-z-index stacking escape) — both only visible by actually reading Playwright screenshots, not from console output. See `frontend/README.md` for details.

- [x] **Milestone 7 — Trend & comparison charts**
  Two custom D3 visualizations, both reading real live data: a monthly time-series line chart (one line per city, hover tooltip with exact values) and a category comparison chart (top 8 categories, shown as each city's own share, not raw counts, so NYC's volume doesn't drown out Chicago/SF). Needed two new backend endpoints (`GET /api/trends/monthly`, `GET /api/trends/categories`). Caught a real data-integrity bug in the process: the current calendar month is always incomplete at pipeline-pull time (SF's partial month sat at ~430 incidents vs. a normal ~7,500-8,000, which would have shown a misleading cliff in the chart) — fixed at the API level by excluding any in-progress month, not just patched in the chart. See `frontend/README.md` for the D3 implementation pattern.

- [ ] **Milestone 8 — Case study narrative sections**
  Human-story sections built around cited, already-public case studies, tied back into the surrounding data.

- [ ] **Milestone 9 — Polish pass**
  Animation refinement, full responsive pass, accessibility audit (contrast, reduced-motion, keyboard nav), performance pass, and a designed "waking up the data" loading sequence for the free-tier backend's cold start (see `docs/ARCHITECTURE.md`).

- [ ] **Milestone 10 — Deployment & documentation**
  Production deploy (Vercel for frontend, Render for backend, Neon for database — all free tier), final README with screenshots/GIFs, walkthrough write-up for portfolio use.
