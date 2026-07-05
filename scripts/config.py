"""
Shared configuration for the data pipeline (fetch -> clean -> geospatial join -> aggregate).

All dataset IDs below were confirmed live against their real APIs during Milestone 1/2
(see docs/DATA_SOURCES.md and docs/DATA_DICTIONARY.md) -- nothing here is guessed.
"""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
EXTERNAL_DIR = REPO_ROOT / "data" / "external"

for _dir in (RAW_DIR, PROCESSED_DIR, EXTERNAL_DIR):
    _dir.mkdir(parents=True, exist_ok=True)

# How far back the pipeline pulls data. Two years is enough for real month-over-month
# and year-over-year trend charts without turning a portfolio project's data pipeline
# into a multi-hour pull or busting free-tier database storage limits. Bump this later
# if the full project needs a longer historical view -- it's a single constant.
LOOKBACK_YEARS = 2

SOCRATA_PAGE_SIZE = 50_000  # Socrata's practical max page size for unauthenticated pulls

# --- Incident-level datasets ---
CHICAGO_INCIDENTS_ENDPOINT = "https://data.cityofchicago.org/resource/ijzp-q8t2.json"

# NYC splits recent (this calendar year) from historic (prior years) data across two
# datasets with an identical schema. The pipeline queries both and de-duplicates.
NYC_CURRENT_INCIDENTS_ENDPOINT = "https://data.cityofnewyork.us/resource/5uac-w243.json"
NYC_HISTORIC_INCIDENTS_ENDPOINT = "https://data.cityofnewyork.us/resource/qgea-i56i.json"

SF_INCIDENTS_ENDPOINT = "https://data.sfgov.org/resource/wg3w-h783.json"

# --- Neighborhood boundary datasets (for geospatial join + map rendering) ---
# Chicago's original documented ID (cauq-8yn6) and SF's (p5b7-5n3h) both returned null
# geometry when checked live -- both datasets were reformatted/replaced. The IDs below
# were found via Socrata's catalog API and verified to return real polygons.
CHICAGO_BOUNDARIES_ENDPOINT = "https://data.cityofchicago.org/resource/igwz-8jzy.geojson"
NYC_BOUNDARIES_ENDPOINT = "https://data.cityofnewyork.us/resource/9nt8-h7nd.geojson"
SF_BOUNDARIES_ENDPOINT = "https://data.sfgov.org/resource/j2bu-swwd.geojson"

CHICAGO_BOUNDARIES_FILE = EXTERNAL_DIR / "chicago_community_areas.geojson"
NYC_BOUNDARIES_FILE = EXTERNAL_DIR / "nyc_neighborhood_tabulation_areas.geojson"
SF_BOUNDARIES_FILE = EXTERNAL_DIR / "sf_analysis_neighborhoods.geojson"

CHICAGO_RAW_FILE = RAW_DIR / "chicago_incidents.parquet"
NYC_RAW_FILE = RAW_DIR / "nyc_incidents.parquet"
SF_RAW_FILE = RAW_DIR / "sf_incidents.parquet"

INCIDENTS_PROCESSED_FILE = PROCESSED_DIR / "incidents.parquet"
NEIGHBORHOODS_PROCESSED_FILE = PROCESSED_DIR / "neighborhoods.parquet"
MONTHLY_AGGREGATES_FILE = PROCESSED_DIR / "monthly_aggregates.parquet"
