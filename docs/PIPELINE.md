# Data Pipeline — Milestone 2

Documents the actual pipeline built in `scripts/`, what it produced, and the design
decisions behind it. See `docs/ARCHITECTURE.md` for the broader system design and
`docs/DATA_DICTIONARY.md` for the raw per-city schemas this pipeline consumes.

## Running it

```bash
source .venv/bin/activate
cd scripts
python3 run_pipeline.py   # runs all four steps below end to end
```

Or run each step individually (useful during development, since the fetch step is the
only slow one):

```bash
python3 fetch_boundaries.py   # one-time; boundary files are committed to the repo
python3 fetch_incidents.py    # pulls ~1.65M rows from live APIs, takes a few minutes
python3 clean_normalize.py
python3 geospatial_join.py
python3 build_aggregates.py
```

## What it does

1. **Fetch** (`fetch_incidents.py`) — pulls every incident from the last `LOOKBACK_YEARS`
   (currently 2, see `scripts/config.py`) from all three cities' live APIs, paginating in
   50,000-row pages with a trimmed `$select` to keep payload size down. NYC requires
   querying both its "historic" and "current year-to-date" datasets and de-duplicating
   by complaint number, since NYC splits its data across two datasets with an identical
   schema. Output: `data/raw/{city}_incidents.parquet` (gitignored — large, regenerable).

2. **Clean & normalize** (`clean_normalize.py`) — standardizes each city into one shared
   schema, fixes known dirty data (NYC's stray `"2026"`/`"-960"`/`"-968"` sentinel values
   in age-group fields, literal `"(null)"` strings, `(0,0)` "null island" coordinates),
   and maps every raw category label to a shared 21-value taxonomy via
   `category_mapping.py`. Output: `data/processed/incidents.parquet` (gitignored — 38MB,
   regenerable, and holds NYC's per-complaint demographic fields, which we don't want
   sitting in git history even though the source is public).

3. **Geospatial join** (`geospatial_join.py`) — assigns every incident a
   `neighborhood_id` and `neighborhood_name`. Three different strategies, because the
   three cities' geography fields are fundamentally different (see
   `docs/DATA_DICTIONARY.md`):
   - **Chicago**: simple attribute join — `chicago_community_area` (numeric code) to the
     boundary file's `area_numbe` field.
   - **SF**: simple name join — `sf_neighborhood_raw` to the boundary file's `nhood`
     field, exact string match.
   - **NYC**: a real point-in-polygon spatial join (`geopandas.sjoin`) of each
     incident's (longitude, latitude) against 262 Neighborhood Tabulation Area
     polygons, since NYC's incident data has no pre-assigned neighborhood field at all.

   Also builds `data/processed/neighborhoods.parquet` — a small unified reference table
   (380 rows: 77 Chicago community areas + 262 NYC NTAs + 41 SF neighborhoods) with
   geometry stored as WKT, plus a `.geojson` sibling for direct map use later.

4. **Aggregate** (`build_aggregates.py`) — groups the 1.65M-row incidents table down to
   monthly counts by city × category × neighborhood. This is the table the production
   database and API actually serve (see "precompute aggressively" in
   `docs/ARCHITECTURE.md`) — the frontend's charts and maps never need to query the
   full incident-level table.

## Results (pipeline run on 2026-07-05, 2-year window: 2024-07-05 to present)

| | Chicago | NYC | SF | Total |
|---|---|---|---|---|
| Raw incidents pulled | 474,941 | 985,445 (after de-duping historic+current) | 191,731 | 1,652,117 |
| Neighborhood match rate | 100.0% | 100.0% (spatial join) | 95.3% | — |
| Neighborhoods (boundary file) | 77 | 262 | 41 | 380 |

- **Monthly aggregate table:** 98,759 rows, **264 KB**. This single number validates the
  "precompute aggressively" architecture call from Milestone 0 — the entire dataset the
  live site needs to query fits comfortably in any free-tier database, no matter how
  the underlying 1.65M-row incident table grows.
- **Category distribution** (top 5 of 21 shared categories, all cities combined): theft
  (444,658), assault/battery (301,983), other/administrative (153,509),
  stalking/harassment (148,964), criminal damage/vandalism (126,876).
- **Chicago's `domestic` flag**: 89,561 of 474,941 Chicago incidents (18.9%) — consistent
  with the 19.7% found in Milestone 1's smaller sample. Reminder: this is a
  Chicago-only signal (`chicago_domestic_flag` column), not comparable to the
  `domestic_family_related` shared category, which is a much weaker, category-label-based
  signal that only exists for a handful of raw labels (Chicago's rare literal
  `"DOMESTIC VIOLENCE"` primary_type, NYC's child-abandonment-related offenses, and SF's
  "Offences Against The Family And Children") and undercounts real domestic-related
  incidents substantially. Never conflate the two in the site's narrative.

## Category taxonomy

21 shared categories (`scripts/category_mapping.py`), built from every real distinct
category value returned by each city's API (not guessed from samples) — including NYC's
"Historic" dataset, which turned out to have ~24 legacy category labels not present in
its "current year" dataset (e.g. `"LOITERING/GAMBLING (CARDS, DIC"`, a truncated legacy
code). The mapping function raises on any unmapped value rather than silently
defaulting, so this was caught as a hard pipeline failure during development rather than
a silent miscategorization — exactly the intended behavior.

## Known limitations carried forward from Milestone 1

- Cross-city "domestic-related" comparisons cannot be made on equal footing (see above).
- NYC's suspect/victim demographic fields remain ~33-38% unusable (`"UNKNOWN"`/null) —
  the pipeline preserves this rather than papering over it; any future demographic
  analysis (Milestone 7+) must follow the policy in `docs/ETHICS.md`.
- SF's 4.7% unmatched neighborhood rate (`neighborhood_id` is null) reflects real missing
  geocoding in the source data, not a pipeline bug — confirmed against Milestone 1's
  finding of ~3.4-4.7% missing `analysis_neighborhood`/coordinates in SF's raw data.
