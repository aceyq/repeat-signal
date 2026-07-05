"""
Cleans each city's raw pull and normalizes all three into one shared incident schema.

Run standalone: python scripts/clean_normalize.py (after fetch_incidents.py has run)

Unified schema (see docs/ARCHITECTURE.md for the full data model):
    city, incident_id, occurred_at, category, raw_category, latitude, longitude,
    chicago_community_area, sf_neighborhood_raw,      -- pre-geojoin geography keys
    chicago_domestic_flag, chicago_arrest,             -- Chicago-only signals
    sf_resolution,                                     -- SF-only signal
    nyc_severity, susp_race, susp_sex, susp_age_group,
    vic_race, vic_sex, vic_age_group                   -- NYC-only signals (see docs/ETHICS.md)

City-specific fields are intentionally kept separate rather than forced into shared
columns that don't mean the same thing across cities (e.g. Chicago's `arrest` boolean,
SF's `resolution` category, and NYC's `law_cat_cd` severity are different concepts).
"""

import numpy as np
import pandas as pd

from category_mapping import map_category
from config import (
    CHICAGO_RAW_FILE,
    INCIDENTS_PROCESSED_FILE,
    NYC_RAW_FILE,
    SF_RAW_FILE,
)

VALID_NYC_AGE_GROUPS = {"<18", "18-24", "25-44", "45-64", "65+", "UNKNOWN"}

# Columns that are entirely pd.NA for a given city's rows (e.g. sf_neighborhood_raw
# for Chicago rows). Explicitly typed as object so concatenating the three cities'
# frames doesn't hit pandas' "empty/all-NA column" dtype-inference FutureWarning.
_OBJECT_NULLABLE_COLUMNS = [
    "sf_neighborhood_raw", "sf_resolution", "nyc_severity",
    "susp_race", "susp_sex", "susp_age_group", "vic_race", "vic_sex", "vic_age_group",
]


def _all_na(index, dtype):
    """A full-length, all-missing column in a specific nullable dtype -- avoids the
    pandas FutureWarning that comes from concatenating bare `pd.NA` scalar columns
    (which infer as ambiguous dtype) across frames that have a real dtype for that
    same column in another city.
    """
    return pd.array([pd.NA] * len(index), dtype=dtype)


def _null_island_to_nan(df: pd.DataFrame) -> pd.DataFrame:
    """Treat (0, 0) coordinates -- a common geocoding-failure placeholder -- as missing."""
    null_island = (df["latitude"] == 0) & (df["longitude"] == 0)
    df.loc[null_island, ["latitude", "longitude"]] = np.nan
    return df


def clean_chicago(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["occurred_at"] = pd.to_datetime(df["date"], errors="coerce")
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df = _null_island_to_nan(df)

    df["raw_category"] = df["primary_type"]
    df["category"] = df["raw_category"].apply(lambda v: map_category("chicago", v))

    out = pd.DataFrame({
        "city": "chicago",
        "incident_id": df["id"].astype(str),
        "occurred_at": df["occurred_at"],
        "category": df["category"],
        "raw_category": df["raw_category"],
        "latitude": df["latitude"],
        "longitude": df["longitude"],
        "chicago_community_area": pd.to_numeric(df["community_area"], errors="coerce").astype("Float64"),
        "sf_neighborhood_raw": pd.NA,
        "chicago_domestic_flag": df["domestic"].astype("boolean"),
        "chicago_arrest": df["arrest"].astype("boolean"),
        "sf_resolution": pd.NA,
        "nyc_severity": pd.NA,
        "susp_race": pd.NA, "susp_sex": pd.NA, "susp_age_group": pd.NA,
        "vic_race": pd.NA, "vic_sex": pd.NA, "vic_age_group": pd.NA,
    })
    return out


def clean_nyc(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["occurred_at"] = pd.to_datetime(df["cmplnt_fr_dt"], errors="coerce")
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df = _null_island_to_nan(df)

    df["raw_category"] = df["ofns_desc"].replace({"(null)": np.nan})
    df["category"] = df["raw_category"].apply(lambda v: map_category("nyc", v) if pd.notna(v) else "other_administrative")

    # Clean known dirty sentinel values found in Milestone 1 exploration (e.g. "2026", "-960", "-968")
    def clean_age_group(value):
        if value in VALID_NYC_AGE_GROUPS:
            return value
        return "UNKNOWN"

    def clean_null_string(value):
        return np.nan if value in ("(null)", None) else value

    out = pd.DataFrame({
        "city": "nyc",
        "incident_id": df["cmplnt_num"].astype(str),
        "occurred_at": df["occurred_at"],
        "category": df["category"],
        "raw_category": df["raw_category"],
        "latitude": df["latitude"],
        "longitude": df["longitude"],
        "chicago_community_area": _all_na(df.index, "Float64"),
        "sf_neighborhood_raw": pd.NA,
        "chicago_domestic_flag": _all_na(df.index, "boolean"),
        "chicago_arrest": _all_na(df.index, "boolean"),
        "sf_resolution": pd.NA,
        "nyc_severity": df["law_cat_cd"].apply(clean_null_string),
        "susp_race": df["susp_race"].apply(clean_null_string),
        "susp_sex": df["susp_sex"].apply(clean_null_string),
        "susp_age_group": df["susp_age_group"].apply(clean_age_group),
        "vic_race": df["vic_race"].apply(clean_null_string),
        "vic_sex": df["vic_sex"].apply(clean_null_string),
        "vic_age_group": df["vic_age_group"].apply(clean_age_group),
    })
    return out


def clean_sf(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["occurred_at"] = pd.to_datetime(df["incident_datetime"], errors="coerce")
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df = _null_island_to_nan(df)

    df["raw_category"] = df["incident_category"]
    df["category"] = df["raw_category"].apply(lambda v: map_category("sf", v) if pd.notna(v) else "other_administrative")

    out = pd.DataFrame({
        "city": "sf",
        "incident_id": df["row_id"].astype(str),
        "occurred_at": df["occurred_at"],
        "category": df["category"],
        "raw_category": df["raw_category"],
        "latitude": df["latitude"],
        "longitude": df["longitude"],
        "chicago_community_area": _all_na(df.index, "Float64"),
        "sf_neighborhood_raw": df["analysis_neighborhood"],
        "chicago_domestic_flag": _all_na(df.index, "boolean"),
        "chicago_arrest": _all_na(df.index, "boolean"),
        "sf_resolution": df["resolution"],
        "nyc_severity": pd.NA,
        "susp_race": pd.NA, "susp_sex": pd.NA, "susp_age_group": pd.NA,
        "vic_race": pd.NA, "vic_sex": pd.NA, "vic_age_group": pd.NA,
    })
    return out


def _fix_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    for col in _OBJECT_NULLABLE_COLUMNS:
        df[col] = df[col].astype(object)
    return df


def main() -> None:
    chicago_raw = pd.read_parquet(CHICAGO_RAW_FILE)
    nyc_raw = pd.read_parquet(NYC_RAW_FILE)
    sf_raw = pd.read_parquet(SF_RAW_FILE)

    print(f"Cleaning {len(chicago_raw):,} Chicago rows ...")
    chicago_clean = _fix_dtypes(clean_chicago(chicago_raw))

    print(f"Cleaning {len(nyc_raw):,} NYC rows ...")
    nyc_clean = _fix_dtypes(clean_nyc(nyc_raw))

    print(f"Cleaning {len(sf_raw):,} SF rows ...")
    sf_clean = _fix_dtypes(clean_sf(sf_raw))

    incidents = pd.concat([chicago_clean, nyc_clean, sf_clean], ignore_index=True)
    before = len(incidents)
    incidents = incidents.dropna(subset=["occurred_at"])
    print(f"Dropped {before - len(incidents):,} rows with unparseable occurred_at")

    incidents.to_parquet(INCIDENTS_PROCESSED_FILE, index=False)
    print(f"Saved {len(incidents):,} normalized incidents to {INCIDENTS_PROCESSED_FILE}")
    print("\nRows per city:")
    print(incidents["city"].value_counts())
    print("\nRows per shared category:")
    print(incidents["category"].value_counts())


if __name__ == "__main__":
    main()
