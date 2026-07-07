from fastapi import APIRouter, Depends, HTTPException
from shapely.geometry import mapping, shape
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MonthlyAggregate, Neighborhood
from app.schemas import (
    NeighborhoodDetailOut,
    NeighborhoodFeature,
    NeighborhoodFeatureCollection,
    NeighborhoodFeatureProperties,
    NeighborhoodOut,
)

router = APIRouter(prefix="/api/neighborhoods", tags=["neighborhoods"])

# ~0.0005 degrees is roughly 50m at these cities' latitudes -- plenty of detail
# for a neighborhood-level choropleth map, and shrinks payload size substantially
# versus the full-precision boundaries stored in the database.
WEB_SIMPLIFY_TOLERANCE = 0.0005


@router.get("", response_model=list[NeighborhoodOut])
def list_neighborhoods(city: str | None = None, db: Session = Depends(get_db)) -> list[NeighborhoodOut]:
    """Neighborhood listing (no geometry -- see NeighborhoodOut). Optionally filter by city."""
    query = select(Neighborhood)
    if city is not None:
        query = query.where(Neighborhood.city == city)
    neighborhoods = db.execute(query.order_by(Neighborhood.city, Neighborhood.name)).scalars().all()
    return [NeighborhoodOut.model_validate(n) for n in neighborhoods]


@router.get("/geojson", response_model=NeighborhoodFeatureCollection)
def get_neighborhoods_geojson(
    city: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
) -> NeighborhoodFeatureCollection:
    """Neighborhood boundaries + total incident counts as one GeoJSON FeatureCollection
    -- built for the map (Milestone 6). Counts sum the full 2-year window unless
    `category` narrows it; `city` limits which neighborhoods are returned at all
    (fetched on demand per city as the user scrolls, not all 380 at once).
    """
    agg_query = select(
        MonthlyAggregate.neighborhood_id,
        func.sum(MonthlyAggregate.incident_count).label("incident_count"),
    ).group_by(MonthlyAggregate.neighborhood_id)
    if category is not None:
        agg_query = agg_query.where(MonthlyAggregate.category == category)
    agg_by_neighborhood = {row.neighborhood_id: row.incident_count for row in db.execute(agg_query)}

    query = select(Neighborhood)
    if city is not None:
        query = query.where(Neighborhood.city == city)
    neighborhoods = db.execute(query).scalars().all()

    features = []
    for n in neighborhoods:
        simplified_geometry = mapping(shape(n.geometry).simplify(WEB_SIMPLIFY_TOLERANCE))
        features.append(
            NeighborhoodFeature(
                geometry=simplified_geometry,
                properties=NeighborhoodFeatureProperties(
                    id=n.id,
                    city=n.city,
                    name=n.name,
                    incident_count=agg_by_neighborhood.get(n.id, 0),
                ),
            )
        )
    return NeighborhoodFeatureCollection(features=features)


@router.get("/{neighborhood_id}", response_model=NeighborhoodDetailOut)
def get_neighborhood(neighborhood_id: str, db: Session = Depends(get_db)) -> NeighborhoodDetailOut:
    """Single neighborhood, including its boundary geometry as GeoJSON (for the map)."""
    neighborhood = db.get(Neighborhood, neighborhood_id)
    if neighborhood is None:
        raise HTTPException(status_code=404, detail=f"Neighborhood '{neighborhood_id}' not found")
    return NeighborhoodDetailOut.model_validate(neighborhood)
