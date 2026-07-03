# Repeat Signal

*A working title — an interactive data-storytelling project exploring patterns in public police report and 911 call-for-service data across multiple U.S. cities.*

> **Status:** 🚧 Early development — Milestone 0 (architecture & repo setup) complete.

## What this is

Repeat Signal is not a crime dashboard. It's an interactive, documentary-style website that walks a reader through what public safety data can — and can't — tell us about repeated contact with law enforcement before serious incidents occur.

The project was inspired by a recurring pattern in true crime reporting: victims or their families often contacted police multiple times before a tragedy. This project asks, responsibly and with data:

- What types of incidents are reported most frequently, and how does that vary by neighborhood?
- Are there measurable patterns in repeat calls-for-service at the same location or for the same incident type?
- How do these patterns change over time, and how do they compare across cities?
- What are the hard limits of this data — what can we *not* conclude from it?
- What do specific, already-public case studies teach us about the human side of these patterns?

This project does **not** claim to identify individual victims, does not attempt to re-identify anyone from redacted public data, and does not draw causal or political conclusions. See [docs/ETHICS.md](docs/ETHICS.md) for the full statement on data limitations and responsible use.

## Cities covered

Chicago, New York City, and San Francisco — chosen for large, well-documented open data programs and enough geographic/demographic variation to make a real cross-city comparison meaningful. See [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) for exact datasets and access details.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, D3.js, MapLibre GL JS |
| Backend | Python, FastAPI |
| Database | PostgreSQL (+ PostGIS for geospatial queries) |
| Data processing | Pandas, GeoPandas, Jupyter |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

Full reasoning behind these choices is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Repository structure

```
repeat-signal/
├── frontend/         # Next.js application
├── backend/          # FastAPI application
├── data/
│   ├── raw/          # Immutable raw downloads (gitignored)
│   ├── processed/    # Cleaned/aggregated datasets
│   └── external/     # Neighborhood/precinct boundary files (GeoJSON)
├── notebooks/         # Exploratory analysis & pipeline development
├── scripts/            # Standalone data pipeline scripts (production version of notebook logic)
├── docs/               # Architecture, data sources, ethics, roadmap
└── docker-compose.yml  # Local Postgres/PostGIS for development
```

## Project roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full milestone breakdown. We're building this incrementally, one milestone at a time.

## Running this project locally

Instructions will be added as each layer (data pipeline, backend, frontend) is built out. Nothing to run yet beyond the repo skeleton.

## License

MIT — see [LICENSE](LICENSE).
