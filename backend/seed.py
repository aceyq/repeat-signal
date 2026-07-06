"""
Loads data/processed/neighborhoods.parquet and monthly_aggregates.parquet (produced by
../scripts/run_pipeline.py) into the database. Safe to re-run -- truncates both tables
first, so this is idempotent, not an append.

Usage: python seed.py (run alembic migrations first: alembic upgrade head)
"""

from pathlib import Path

import pandas as pd
from shapely import wkt
from shapely.geometry import mapping
from sqlalchemy import delete

from app.database import SessionLocal
from app.models import MonthlyAggregate, Neighborhood

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"


def seed_neighborhoods(session) -> None:
    df = pd.read_parquet(PROCESSED_DIR / "neighborhoods.parquet")
    session.execute(delete(Neighborhood))
    for row in df.itertuples(index=False):
        geometry_geojson = mapping(wkt.loads(row.geometry_wkt))  # WKT -> GeoJSON dict
        session.add(
            Neighborhood(id=row.neighborhood_id, city=row.city, name=row.name, geometry=geometry_geojson)
        )
    session.commit()
    print(f"Seeded {len(df):,} neighborhoods")


def seed_monthly_aggregates(session) -> None:
    df = pd.read_parquet(PROCESSED_DIR / "monthly_aggregates.parquet")
    session.execute(delete(MonthlyAggregate))
    session.commit()

    records = df.to_dict(orient="records")
    for record in records:
        record["year_month"] = record["year_month"].date()
        if pd.isna(record.get("neighborhood_id")):
            record["neighborhood_id"] = None
        if pd.isna(record.get("neighborhood_name")):
            record["neighborhood_name"] = None
        if pd.isna(record.get("chicago_domestic_flag_count")):
            record["chicago_domestic_flag_count"] = None
        else:
            record["chicago_domestic_flag_count"] = int(record["chicago_domestic_flag_count"])
    session.bulk_insert_mappings(MonthlyAggregate, records)
    session.commit()
    print(f"Seeded {len(records):,} monthly aggregate rows")


def main() -> None:
    session = SessionLocal()
    try:
        print("Seeding neighborhoods (must run before monthly_aggregates, which foreign-keys to it) ...")
        seed_neighborhoods(session)
        print("Seeding monthly aggregates ...")
        seed_monthly_aggregates(session)
    finally:
        session.close()


if __name__ == "__main__":
    main()
