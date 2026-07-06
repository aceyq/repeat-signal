# Architecture

## Guiding principle

This site is read far more than it's written to, and its core value is a *narrative experience*, not a live transactional system. The architecture optimizes for: (1) fast, smooth, animation-heavy front-end delivery, and (2) a backend that demonstrates real data engineering and API design without inventing complexity the project doesn't need.

## System overview

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────────┐
│  Data pipeline   │        │   FastAPI backend │        │   Next.js frontend   │
│  (Pandas/GeoPandas│  -->  │  (read-mostly API) │  -->  │  (App Router, SSR/   │
│   in notebooks/    │        │  + PostgreSQL       │    │   client islands)     │
│   scripts)          │        │                    │        │                       │
└─────────────────┘        └──────────────────┘        └─────────────────────┘
     runs offline            deployed on Render +          deployed on Vercel
     (not user-facing)         Neon (Postgres)
```

### 1. Data pipeline (offline, not user-facing)

Raw data is pulled from each city's open data portal, cleaned, normalized into a **shared cross-city schema**, geocoded/joined to neighborhood boundaries, and aggregated into the tables the API actually serves (e.g., "incidents per neighborhood per month per category"). This work happens in `notebooks/` first (for exploration) and is then promoted into repeatable `scripts/` once the logic is settled — that promotion path is itself a good engineering story for interviews ("I prototype in notebooks, then productionize into tested scripts").

We precompute aggressively. The frontend should rarely need the backend to do expensive computation live — most heavy lifting happens once, offline, and gets stored as query-ready rows.

### 2. Backend — FastAPI + PostgreSQL

A real backend, but a *read-mostly* one:

- **PostgreSQL** stores the two small tables the pipeline produces: `neighborhoods` and `monthly_aggregates` (see `docs/PIPELINE.md`). **No PostGIS** — all spatial computation (the point-in-polygon join assigning incidents to neighborhoods) already happened offline in the Milestone 2 pipeline via GeoPandas; the database only needs to store and return precomputed neighborhood boundaries as GeoJSON (a plain `JSON` column), never compute anything spatial itself. This was a deliberate Milestone 3 revision from the original plan — PostGIS pulls in a GDAL/protobuf/LLVM build chain that turned out to compile from source (multi-hour, failure-prone) on an unsupported OS/Homebrew configuration, and going through with it would have bought us a live spatial-query engine we don't actually use anywhere. Right-sizing the database to what the system actually needs, discovered mid-build, beats forcing through a heavier dependency because it was the original plan.
- **FastAPI** exposes a small number of well-designed endpoints: filter by city, date range, incident category, neighborhood; return time series and geo-aggregated data as JSON. Pydantic models give us typed request/response contracts — good practice, and a natural place to talk about data validation in interviews.
- **Alembic** manages schema migrations, SQLAlchemy 2.0 (via the `psycopg` v3 driver) is the ORM/query layer.
- No user accounts, no writes from the public — this is a public-data read API, which keeps scope honest instead of bolting on auth/CRUD the project doesn't need.
- Deployed on **Render's free tier**, with **Neon** providing managed serverless Postgres (also free tier). Both are $0/month, which matters for a portfolio project that may sit idle between application cycles.
- **Trade-off we're accepting:** Render's free tier spins the service down after ~15 minutes of no traffic. The first request after idle takes 30-50 seconds to wake back up. Rather than pay to avoid this (Railway's always-on Hobby plan is ~$5/month) or hide it, we design for it directly: the frontend shows an intentional "loading the data..." sequence during a cold start instead of a blank/broken-looking page (see Milestone 9 in `docs/ROADMAP.md`). This is a real, defensible engineering trade-off to be able to explain in interviews, not a workaround to be embarrassed about.

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

## Cross-city data model (as built in Milestone 2)

Each city's raw schema is different (different column names, categories, geographies). The pipeline (`scripts/`, documented in `docs/PIPELINE.md`) normalizes all three into one shared schema:

- `incidents` — one row per reported incident: `city`, `incident_id`, `occurred_at`, `category` (normalized across cities into a shared 21-value taxonomy), `raw_category` (original label, kept for transparency), `neighborhood_id`, `neighborhood_name`, `latitude`, `longitude`, plus a small set of intentionally city-specific columns that aren't forced into a shared field because they don't mean the same thing across cities (`chicago_domestic_flag`, `chicago_arrest`, `sf_resolution`, `nyc_severity`, and NYC's suspect/victim demographic fields, governed by `docs/ETHICS.md`).
- `neighborhoods` — one row per city neighborhood/precinct/community area boundary (380 total: 77 Chicago + 262 NYC + 41 SF), with geometry, used both for maps and for aggregation.
- `monthly_aggregates` — monthly counts by city × category × neighborhood, materialized from `incidents`. This is what the API actually serves; at 98,759 rows / 264 KB for a 2-year window across all three cities, it comfortably fits any free-tier database regardless of how large the underlying incident-level data grows. The frontend's charts and maps read from this table, not the multi-million-row incident table.

The full incident-level table (1.65M rows, 38MB) and raw per-city pulls are gitignored — they're regenerable in a few minutes via `python scripts/run_pipeline.py` and, in NYC's case, contain individual-level demographic data that shouldn't sit in git history even though the source is public. Only the small `neighborhoods` and `monthly_aggregates` tables are committed, since those are what Milestone 3's database actually loads.

## Local development (once scaffolded)

- `docker-compose.yml` at the repo root spins up a local PostgreSQL instance so the backend can be developed without touching the production database (only usable on Docker-capable machines; see `backend/README.md` for the native-Postgres alternative used during this project's own development).
- Frontend and backend are developed and run independently (`npm run dev` / `uvicorn ...`), talking to each other over HTTP on localhost during development.
