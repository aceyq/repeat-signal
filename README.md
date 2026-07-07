# Repeat Signal

*A working title — an interactive data-storytelling project exploring patterns in public police report and 911 call-for-service data across multiple U.S. cities.*

> **Status:** 🚧 Early development — Milestone 8 of 10 complete. The full narrative arc of the homepage is now built: hero, premise, live data stats, stated limits, an interactive map, D3 trend/comparison charts, and three cited case studies — all driven by live data end to end. Remaining: a polish pass and public deployment.

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
| Database | PostgreSQL |
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
└── docker-compose.yml  # Local Postgres for development
```

## Project roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full milestone breakdown. We're building this incrementally, one milestone at a time.

## Running this project locally

### Data notebooks (Milestone 1+)

```bash
cd repeat-signal
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
jupyter lab notebooks/          # opens Jupyter in your browser
```

Open any notebook in `notebooks/` and run all cells top to bottom — each one pulls a live sample directly from the relevant city's open data API, so an internet connection is required. No API keys/tokens are needed for this exploratory volume of requests.

### Data pipeline (Milestone 2+)

With the same virtual environment active:

```bash
cd scripts
python3 run_pipeline.py
```

Pulls a real 2-year window from all three cities' live APIs, cleans and normalizes it into a shared schema, geospatially joins every incident to a named neighborhood, and produces the small monthly aggregate table the API will serve. Takes a few minutes (mostly the initial data fetch). See `docs/PIPELINE.md` for what each step does and why.

### Backend API (Milestone 3+)

See [backend/README.md](backend/README.md) for full setup (separate virtual environment, Postgres setup, migrations, seeding, running the API, and tests).

### Frontend (Milestone 4+)

See [frontend/README.md](frontend/README.md) for full setup (Next.js dev server, design system notes, environment variables). Requires the backend running.

## License

MIT — see [LICENSE](LICENSE).
