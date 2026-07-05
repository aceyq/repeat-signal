"""
Pulls the full LOOKBACK_YEARS window of incident-level data from each city's live API
and saves it to data/raw/*.parquet. This is the "full pipeline pull" that Milestone 1's
notebooks intentionally deferred (they only sampled 20k recent rows for exploration).

Run standalone: python scripts/fetch_incidents.py
Safe to re-run -- each run overwrites the raw parquet files with a fresh pull.
"""

from datetime import datetime, timedelta, timezone

import pandas as pd
import requests

from config import (
    CHICAGO_INCIDENTS_ENDPOINT,
    CHICAGO_RAW_FILE,
    LOOKBACK_YEARS,
    NYC_CURRENT_INCIDENTS_ENDPOINT,
    NYC_HISTORIC_INCIDENTS_ENDPOINT,
    NYC_RAW_FILE,
    SF_INCIDENTS_ENDPOINT,
    SF_RAW_FILE,
    SOCRATA_PAGE_SIZE,
)

CUTOFF = datetime.now(timezone.utc) - timedelta(days=365 * LOOKBACK_YEARS)
CUTOFF_ISO = CUTOFF.strftime("%Y-%m-%dT00:00:00.000")


def fetch_paginated(endpoint: str, date_field: str, columns: list[str], cutoff_iso: str) -> pd.DataFrame:
    """Pull every row where `date_field >= cutoff_iso`, paginating with $limit/$offset."""
    select_clause = ",".join(columns)
    where_clause = f"{date_field} >= '{cutoff_iso}'"
    frames = []
    offset = 0
    while True:
        params = {
            "$select": select_clause,
            "$where": where_clause,
            "$order": f"{date_field}",
            "$limit": SOCRATA_PAGE_SIZE,
            "$offset": offset,
        }
        response = requests.get(endpoint, params=params, timeout=120)
        response.raise_for_status()
        page = response.json()
        if not page:
            break
        frames.append(pd.DataFrame(page))
        offset += len(page)
        print(f"  ... fetched {offset:,} rows so far from {endpoint.split('/')[2]}")
        if len(page) < SOCRATA_PAGE_SIZE:
            break
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame(columns=columns)


def fetch_chicago() -> pd.DataFrame:
    print(f"Fetching Chicago incidents since {CUTOFF_ISO} ...")
    columns = [
        "id", "case_number", "date", "primary_type", "description",
        "community_area", "domestic", "arrest", "latitude", "longitude",
        "block", "location_description",
    ]
    df = fetch_paginated(CHICAGO_INCIDENTS_ENDPOINT, "date", columns, CUTOFF_ISO)
    df["city"] = "chicago"
    return df


def fetch_nyc() -> pd.DataFrame:
    print(f"Fetching NYC incidents since {CUTOFF_ISO} (historic + current YTD) ...")
    columns = [
        "cmplnt_num", "cmplnt_fr_dt", "cmplnt_fr_tm", "ofns_desc", "pd_desc",
        "law_cat_cd", "boro_nm", "addr_pct_cd", "latitude", "longitude",
        "susp_race", "susp_sex", "susp_age_group", "vic_race", "vic_sex",
        "vic_age_group", "prem_typ_desc",
    ]
    historic = fetch_paginated(NYC_HISTORIC_INCIDENTS_ENDPOINT, "cmplnt_fr_dt", columns, CUTOFF_ISO)
    current = fetch_paginated(NYC_CURRENT_INCIDENTS_ENDPOINT, "cmplnt_fr_dt", columns, CUTOFF_ISO)
    df = pd.concat([historic, current], ignore_index=True)
    before = len(df)
    df = df.drop_duplicates(subset="cmplnt_num")
    print(f"  historic+current combined: {before:,} rows, {before - len(df):,} duplicates removed")
    df["city"] = "nyc"
    return df


def fetch_sf() -> pd.DataFrame:
    print(f"Fetching SF incidents since {CUTOFF_ISO} ...")
    columns = [
        "row_id", "incident_datetime", "incident_category", "incident_subcategory",
        "incident_description", "resolution", "analysis_neighborhood",
        "latitude", "longitude", "police_district",
    ]
    df = fetch_paginated(SF_INCIDENTS_ENDPOINT, "incident_datetime", columns, CUTOFF_ISO)
    df["city"] = "sf"
    return df


def main() -> None:
    chicago_df = fetch_chicago()
    chicago_df.to_parquet(CHICAGO_RAW_FILE, index=False)
    print(f"Saved {len(chicago_df):,} Chicago rows to {CHICAGO_RAW_FILE}\n")

    nyc_df = fetch_nyc()
    nyc_df.to_parquet(NYC_RAW_FILE, index=False)
    print(f"Saved {len(nyc_df):,} NYC rows to {NYC_RAW_FILE}\n")

    sf_df = fetch_sf()
    sf_df.to_parquet(SF_RAW_FILE, index=False)
    print(f"Saved {len(sf_df):,} SF rows to {SF_RAW_FILE}\n")


if __name__ == "__main__":
    main()
