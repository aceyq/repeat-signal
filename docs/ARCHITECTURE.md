# Architecture

## Guiding principle

This site is read far more than it's written to, and its core value is a *narrative experience*, not a live transactional system. The architecture optimizes for: (1) fast, smooth, animation-heavy front-end delivery, and (2) a backend that demonstrates real data engineering and API design without inventing complexity the project doesn't need.

## System overview

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────────┐
│  Data pipeline   │        │   FastAPI backend │        │   Next.js frontend   │
│  (Pandas/GeoPandas│  -->  │  (read-mostly API) │  -->  │  (App Router, SSR/   │
│   in notebooks/    │        │  + PostgreSQL/PostGIS│    │   client islands)     │
│   scripts)          │        │                    │        │                       │
└─────────────────┘        └──────────────────┘        └─────────────────────┘
     runs offline               deployed on Railway         deployed on Vercel
     (not user-facing)
```

### 1. Data pipeline (offline, not user-facing)

Raw data is pulled from each city's open data portal, cleaned, normalized into a **shared cross-city schema**, geocoded/joined to neighborhood boundaries, and aggregated into the tables the API actually serves (e.g., "incidents per neighborhood per month per category"). This work happens in `notebooks/` first (for exploration) and is then promoted into repeatable `scripts/` once the logic is settled — that promotion path is itself a good engineering story for interviews ("I prototype in notebooks, then productionize into tested scripts").

We precompute aggressively. The frontend should rarely need the backend to do expensive computation live — most heavy lifting happens once, offline, and gets stored as query-ready rows.

### 2. Backend — FastAPI + PostgreSQL/PostGIS

A real backend, but a *read-mostly* one:

- **PostgreSQL** stores normalized incident-level and pre-aggregated tables. **PostGIS** extension handles geospatial queries (point-in-polygon joins for neighborhood boundaries, distance queries if needed).
- **FastAPI** exposes a small number of well-designed endpoints: filter by city, date range, incident category, neighborhood; return time series and geo-aggregated data as JSON. Pydantic models give us typed request/response contracts — good practice, and a natural place to talk about data validation in interviews.
- No user accounts, no writes from the public — this is a public-data read API, which keeps scope honest instead of bolting on auth/CRUD the project doesn't need.
- Deployed on **Railway**, which also hosts the managed Postgres instance — keeps infra simple for a solo project while still being a "real" cloud deployment.

### 3. Frontend — Next.js + TypeScript

- **Next.js App Router** for file-based routing and server components where they help (initial data fetches, SEO-relevant content); client components for anything interactive (maps, charts, scroll animations).
- **Tailwind CSS** for styling — fast iteration, consistent design tokens (important for the dark, editorial look we want).
- **Framer Motion** for scroll-driven reveal/transition animations — hand-built scrollytelling components rather than a third-party scrollytelling library, so we have full control over pacing and feel.
- **D3.js** for the custom, narrative-driven charts (time series, small multiples, annotated trends). D3 over a higher-level charting library because the whole point of this project is *custom*, documentary-quality visualization, not generic dashboard charts.
- **MapLibre GL JS** for the interactive maps — modern vector-tile rendering, smooth pan/zoom, no API token/billing account required (open-source fork of Mapbox GL after its license change).
- Deployed on **Vercel** — first-class Next.js support, zero-config CI/CD from GitHub.

### Why not simpler (static-only)?

We considered skipping the live backend entirely and just shipping precomputed JSON consumed directly by the frontend. That's a legitimate, faster path — but a big part of this project's resume value is demonstrating backend/API/database engineering, and a real filterable API (by city, date range, category, neighborhood) gives the frontend more flexibility than baking every possible slice into static files ahead of time. We're accepting the added deployment complexity deliberately.

### Why not a bigger/heavier stack (e.g., microservices, Kafka, etc.)?

Would be resume-buzzword-friendly but dishonest to the actual problem size. A monolith FastAPI service and a single Postgres database are the right scale for this project; reviewers who know what they're doing will respect right-sized architecture more than over-engineering.

## Cross-city data model (high level)

Each city's raw schema is different (different column names, categories, geographies). The pipeline normalizes all three into one shared schema, roughly:

- `incidents` — one row per reported incident: `city`, `incident_id`, `occurred_at`, `reported_at`, `category` (normalized across cities), `raw_category` (original label, kept for transparency), `neighborhood_id`, `lat`, `lon`, `source_dataset`, `source_row_id`.
- `neighborhoods` — one row per city neighborhood/precinct/community area boundary, with geometry (PostGIS), used both for maps and for aggregation.
- Aggregate tables (materialized from `incidents`): monthly counts by city/category/neighborhood, used directly by the frontend's charts so the API rarely computes aggregates on the fly.

This schema will be refined once we're inside the actual data during the acquisition milestone — this is the working plan, not a final contract.

## Local development (once scaffolded)

- `docker-compose.yml` at the repo root will spin up a local PostgreSQL + PostGIS instance so the backend can be developed without touching the production database.
- Frontend and backend are developed and run independently (`npm run dev` / `uvicorn ...`), talking to each other over HTTP on localhost during development.
