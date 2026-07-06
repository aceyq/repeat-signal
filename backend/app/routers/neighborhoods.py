from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Neighborhood
from app.schemas import NeighborhoodDetailOut, NeighborhoodOut

router = APIRouter(prefix="/api/neighborhoods", tags=["neighborhoods"])


@router.get("", response_model=list[NeighborhoodOut])
def list_neighborhoods(city: str | None = None, db: Session = Depends(get_db)) -> list[NeighborhoodOut]:
    """Neighborhood listing (no geometry -- see NeighborhoodOut). Optionally filter by city."""
    query = select(Neighborhood)
    if city is not None:
        query = query.where(Neighborhood.city == city)
    neighborhoods = db.execute(query.order_by(Neighborhood.city, Neighborhood.name)).scalars().all()
    return [NeighborhoodOut.model_validate(n) for n in neighborhoods]


@router.get("/{neighborhood_id}", response_model=NeighborhoodDetailOut)
def get_neighborhood(neighborhood_id: str, db: Session = Depends(get_db)) -> NeighborhoodDetailOut:
    """Single neighborhood, including its boundary geometry as GeoJSON (for the map)."""
    neighborhood = db.get(Neighborhood, neighborhood_id)
    if neighborhood is None:
        raise HTTPException(status_code=404, detail=f"Neighborhood '{neighborhood_id}' not found")
    return NeighborhoodDetailOut.model_validate(neighborhood)
