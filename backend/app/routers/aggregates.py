from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MonthlyAggregate
from app.schemas import AggregateRowOut, CityOut, SummaryOut

router = APIRouter(prefix="/api", tags=["aggregates"])


@router.get("/aggregates", response_model=list[AggregateRowOut])
def list_aggregates(
    city: str | None = None,
    category: str | None = None,
    neighborhood_id: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int = Query(default=5000, le=20000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[AggregateRowOut]:
    """
    The main data endpoint: filtered monthly incident counts by city/category/
    neighborhood/date range. Reads from the small pre-aggregated table (see
    docs/PIPELINE.md) -- never queries incident-level data directly.
    """
    query = select(MonthlyAggregate)
    if city is not None:
        query = query.where(MonthlyAggregate.city == city)
    if category is not None:
        query = query.where(MonthlyAggregate.category == category)
    if neighborhood_id is not None:
        query = query.where(MonthlyAggregate.neighborhood_id == neighborhood_id)
    if start_date is not None:
        query = query.where(MonthlyAggregate.year_month >= start_date)
    if end_date is not None:
        query = query.where(MonthlyAggregate.year_month <= end_date)

    query = query.order_by(MonthlyAggregate.year_month).limit(limit).offset(offset)
    rows = db.execute(query).scalars().all()
    return [AggregateRowOut.model_validate(row) for row in rows]


@router.get("/summary", response_model=SummaryOut)
def get_summary(db: Session = Depends(get_db)) -> SummaryOut:
    """Overall totals across all three cities -- powers homepage-level stats (Milestone 5)."""
    city_rows = db.execute(
        select(
            MonthlyAggregate.city,
            func.sum(MonthlyAggregate.incident_count).label("incident_count"),
            func.min(MonthlyAggregate.year_month).label("date_range_start"),
            func.max(MonthlyAggregate.year_month).label("date_range_end"),
        ).group_by(MonthlyAggregate.city)
    ).all()
    cities = [CityOut.model_validate(row._mapping) for row in city_rows]

    return SummaryOut(
        total_incidents=sum(c.incident_count for c in cities),
        date_range_start=min(c.date_range_start for c in cities),
        date_range_end=max(c.date_range_end for c in cities),
        cities=cities,
    )
