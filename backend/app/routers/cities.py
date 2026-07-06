from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MonthlyAggregate
from app.schemas import CityOut

router = APIRouter(prefix="/api/cities", tags=["cities"])


@router.get("", response_model=list[CityOut])
def list_cities(db: Session = Depends(get_db)) -> list[CityOut]:
    """Per-city totals, derived from the monthly aggregate table (see docs/PIPELINE.md)."""
    rows = db.execute(
        select(
            MonthlyAggregate.city,
            func.sum(MonthlyAggregate.incident_count).label("incident_count"),
            func.min(MonthlyAggregate.year_month).label("date_range_start"),
            func.max(MonthlyAggregate.year_month).label("date_range_end"),
        ).group_by(MonthlyAggregate.city)
    ).all()
    return [CityOut.model_validate(row._mapping) for row in rows]
