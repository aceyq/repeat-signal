"""
Builds the small, pre-aggregated monthly tables that the FastAPI backend will
actually serve (see docs/ARCHITECTURE.md -- "we precompute aggressively"). The
frontend's charts and maps read from this table, not from the multi-million-row
incidents table directly.

Run standalone: python scripts/build_aggregates.py (after geospatial_join.py has run)
"""

import pandas as pd

from config import INCIDENTS_PROCESSED_FILE, MONTHLY_AGGREGATES_FILE


def main() -> None:
    incidents = pd.read_parquet(INCIDENTS_PROCESSED_FILE)
    incidents["year_month"] = incidents["occurred_at"].dt.to_period("M").dt.to_timestamp()

    grouped = (
        incidents.groupby(["city", "year_month", "category", "neighborhood_id", "neighborhood_name"], dropna=False)
        .agg(
            incident_count=("incident_id", "count"),
            chicago_domestic_flag_count=("chicago_domestic_flag", "sum"),
        )
        .reset_index()
    )

    # chicago_domestic_flag_count is only meaningful for Chicago rows -- null it out elsewhere
    # rather than implying a real (and misleadingly zero) count for cities without this signal.
    grouped.loc[grouped["city"] != "chicago", "chicago_domestic_flag_count"] = pd.NA

    grouped.to_parquet(MONTHLY_AGGREGATES_FILE, index=False)
    print(f"Saved {len(grouped):,} monthly aggregate rows to {MONTHLY_AGGREGATES_FILE}")
    print(f"\nSize check: {MONTHLY_AGGREGATES_FILE.stat().st_size / 1024:.1f} KB "
          f"(this is what the production database actually needs to store)")
    print("\nTotal incidents represented, by city:")
    print(grouped.groupby("city")["incident_count"].sum())


if __name__ == "__main__":
    main()
