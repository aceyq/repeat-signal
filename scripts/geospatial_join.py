"""
Builds the unified `neighborhoods` reference table and assigns every incident a
`neighborhood_id` + `neighborhood_name`, using a different join strategy per city
since each city's raw geography field is fundamentally different (see
docs/DATA_DICTIONARY.md):

    - Chicago: `chicago_community_area` is a numeric code -> joined to the boundary
      file's `area_numbe` field (a simple attribute join, no geometry math needed).
    - SF: `sf_neighborhood_raw` is already a named neighborhood -> joined to the
      boundary file's `nhood` field by exact name match.
    - NYC: has no pre-assigned neighborhood field at all -> a real point-in-polygon
      spatial join of each incident's (longitude, latitude) against the NTA polygons.

Run standalone: python scripts/geospatial_join.py (after clean_normalize.py has run)
"""

import re

import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

from config import (
    CHICAGO_BOUNDARIES_FILE,
    INCIDENTS_PROCESSED_FILE,
    NEIGHBORHOODS_PROCESSED_FILE,
    NYC_BOUNDARIES_FILE,
    SF_BOUNDARIES_FILE,
)


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def build_neighborhoods_table() -> gpd.GeoDataFrame:
    chicago = gpd.read_file(CHICAGO_BOUNDARIES_FILE)[["area_numbe", "community", "geometry"]].copy()
    chicago["area_numbe"] = chicago["area_numbe"].astype(int)
    chicago["neighborhood_id"] = "chicago_" + chicago["area_numbe"].astype(str)
    chicago["city"] = "chicago"
    chicago["name"] = chicago["community"].str.title()
    chicago["join_key"] = chicago["area_numbe"]

    nyc = gpd.read_file(NYC_BOUNDARIES_FILE)[["nta2020", "ntaname", "boroname", "geometry"]].copy()
    nyc["neighborhood_id"] = "nyc_" + nyc["nta2020"]
    nyc["city"] = "nyc"
    nyc["name"] = nyc["ntaname"] + " (" + nyc["boroname"] + ")"
    nyc["join_key"] = nyc["nta2020"]

    sf = gpd.read_file(SF_BOUNDARIES_FILE)[["nhood", "geometry"]].copy()
    sf["neighborhood_id"] = "sf_" + sf["nhood"].apply(slugify)
    sf["city"] = "sf"
    sf["name"] = sf["nhood"]
    sf["join_key"] = sf["nhood"]

    neighborhoods = pd.concat(
        [
            chicago[["neighborhood_id", "city", "name", "join_key", "geometry"]],
            nyc[["neighborhood_id", "city", "name", "join_key", "geometry"]],
            sf[["neighborhood_id", "city", "name", "join_key", "geometry"]],
        ],
        ignore_index=True,
    )
    return gpd.GeoDataFrame(neighborhoods, geometry="geometry", crs="EPSG:4326")


def join_chicago(incidents: pd.DataFrame, neighborhoods: gpd.GeoDataFrame) -> pd.DataFrame:
    lookup = neighborhoods[neighborhoods["city"] == "chicago"].set_index("join_key")
    mask = incidents["city"] == "chicago"
    codes = incidents.loc[mask, "chicago_community_area"]
    incidents.loc[mask, "neighborhood_id"] = codes.map(lookup["neighborhood_id"])
    incidents.loc[mask, "neighborhood_name"] = codes.map(lookup["name"])
    return incidents


def join_sf(incidents: pd.DataFrame, neighborhoods: gpd.GeoDataFrame) -> pd.DataFrame:
    lookup = neighborhoods[neighborhoods["city"] == "sf"].set_index("join_key")
    mask = incidents["city"] == "sf"
    names = incidents.loc[mask, "sf_neighborhood_raw"]
    incidents.loc[mask, "neighborhood_id"] = names.map(lookup["neighborhood_id"])
    incidents.loc[mask, "neighborhood_name"] = names.map(lookup["name"])
    return incidents


def join_nyc(incidents: pd.DataFrame, neighborhoods: gpd.GeoDataFrame) -> pd.DataFrame:
    nyc_polygons = neighborhoods[neighborhoods["city"] == "nyc"]
    mask = incidents["city"] == "nyc"
    geocoded = mask & incidents["latitude"].notna() & incidents["longitude"].notna()

    points_df = incidents.loc[geocoded, ["longitude", "latitude"]].copy()
    points_gdf = gpd.GeoDataFrame(
        points_df,
        geometry=[Point(xy) for xy in zip(points_df["longitude"], points_df["latitude"])],
        crs="EPSG:4326",
    )

    joined = gpd.sjoin(points_gdf, nyc_polygons[["neighborhood_id", "name", "geometry"]], how="left", predicate="within")
    joined = joined[~joined.index.duplicated(keep="first")]  # a point exactly on a shared boundary can match >1 polygon

    incidents.loc[geocoded, "neighborhood_id"] = joined["neighborhood_id"]
    incidents.loc[geocoded, "neighborhood_name"] = joined["name"]
    return incidents


def main() -> None:
    print("Building unified neighborhoods table from boundary files ...")
    neighborhoods = build_neighborhoods_table()
    neighborhoods_out = neighborhoods.drop(columns=["join_key"])
    neighborhoods_out.to_file(NEIGHBORHOODS_PROCESSED_FILE.with_suffix(".geojson"), driver="GeoJSON")
    neighborhoods_out.assign(geometry_wkt=neighborhoods_out.geometry.to_wkt()).drop(columns="geometry").to_parquet(
        NEIGHBORHOODS_PROCESSED_FILE, index=False
    )
    print(f"Saved {len(neighborhoods_out)} neighborhoods to {NEIGHBORHOODS_PROCESSED_FILE} (+ .geojson)")
    print(neighborhoods_out["city"].value_counts())

    print("\nLoading normalized incidents ...")
    incidents = pd.read_parquet(INCIDENTS_PROCESSED_FILE)
    incidents["neighborhood_id"] = pd.NA
    incidents["neighborhood_name"] = pd.NA

    print("Joining Chicago incidents to community areas (attribute join) ...")
    incidents = join_chicago(incidents, neighborhoods)

    print("Joining SF incidents to analysis neighborhoods (name join) ...")
    incidents = join_sf(incidents, neighborhoods)

    print("Joining NYC incidents to NTAs (spatial point-in-polygon join, this is the slow step) ...")
    incidents = join_nyc(incidents, neighborhoods)

    incidents.to_parquet(INCIDENTS_PROCESSED_FILE, index=False)
    print(f"\nSaved geo-joined incidents back to {INCIDENTS_PROCESSED_FILE}")

    print("\nMatch rate by city (share of rows with a resolved neighborhood_id):")
    match_rate = incidents.groupby("city").apply(
        lambda g: g["neighborhood_id"].notna().mean(), include_groups=False
    )
    print((match_rate * 100).round(1).astype(str) + "%")


if __name__ == "__main__":
    main()
