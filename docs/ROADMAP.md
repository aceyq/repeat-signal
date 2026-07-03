# Roadmap

Built one milestone at a time. Each milestone is only started after the previous one is confirmed working.

- [x] **Milestone 0 — Architecture & repository setup**
  Vision alignment, tech stack decisions, dataset selection, repo skeleton, docs (this folder).

- [ ] **Milestone 1 — Data acquisition & exploration**
  Pull raw data samples from Chicago, NYC, and SF open data APIs; verify live schemas against `docs/DATA_SOURCES.md`; exploratory notebooks; write a data dictionary for each city's raw schema.

- [ ] **Milestone 2 — Data pipeline & cross-city normalization**
  Clean and normalize all three cities into the shared schema from `docs/ARCHITECTURE.md`; geospatial join to neighborhood boundaries; build the pre-aggregated tables the API will serve; promote notebook logic into `scripts/`.

- [ ] **Milestone 3 — Database & backend API**
  PostgreSQL/PostGIS schema, seed script from processed data, FastAPI app with typed endpoints (filter by city/date range/category/neighborhood), basic tests, local Docker Compose setup.

- [ ] **Milestone 4 — Frontend scaffold & design system**
  Next.js app initialized, Tailwind design tokens (typography, color palette, dark mode), base layout/navigation shell, deployed skeleton on Vercel talking to local/dev API.

- [ ] **Milestone 5 — Homepage hero & scrollytelling intro**
  The first-impression landing sequence — this is the "documentary opening" and the highest-leverage design work in the project.

- [ ] **Milestone 6 — Interactive map section**
  MapLibre GL map(s) showing neighborhood-level patterns across the three cities, with smooth transitions tied to scroll/narrative position.

- [ ] **Milestone 7 — Trend & comparison charts**
  Custom D3 visualizations for time trends and cross-city/category comparisons, annotated in-narrative rather than presented as a raw dashboard.

- [ ] **Milestone 8 — Case study narrative sections**
  Human-story sections built around cited, already-public case studies, tied back into the surrounding data.

- [ ] **Milestone 9 — Polish pass**
  Animation refinement, full responsive pass, accessibility audit (contrast, reduced-motion, keyboard nav), performance pass.

- [ ] **Milestone 10 — Deployment & documentation**
  Production deploy (Vercel + Railway), final README with screenshots/GIFs, walkthrough write-up for portfolio use.
