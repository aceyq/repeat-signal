from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MonthlyAggregate
from app.schemas import CategoryTrendOut, MonthlyTrendOut

router = APIRouter(prefix="/api/trends", tags=["trends"])


@router.get("/monthly", response_model=list[MonthlyTrendOut])
def get_monthly_trends(
    city: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
) -> list[MonthlyTrendOut]:
    """
    Total incidents per city per month, summed across every neighborhood (and every
    category, unless one is specified). Shaped directly for the Milestone 7 time-series
    chart -- small enough (city-months, not city-neighborhood-months) to fetch in full.

    Excludes the current calendar month: whichever month the pipeline was last run in
    is necessarily incomplete (only however many days had elapsed at pull time), which
    showed up as e.g. San Francisco's "July 2026" bucket sitting at ~430 incidents
    against a normal month of ~7,500-8,000 -- not a real drop, just a partial month. A
    monthly time series should only ever plot fully-elapsed months.
    """
    current_month_start = date.today().replace(day=1)

    query = (
        select(
            MonthlyAggregate.city,
            MonthlyAggregate.year_month,
            func.sum(MonthlyAggregate.incident_count).label("incident_count"),
        )
        .where(MonthlyAggregate.year_month < current_month_start)
        .group_by(MonthlyAggregate.city, MonthlyAggregate.year_month)
    )
    if city is not None:
        query = query.where(MonthlyAggregate.city == city)
    if category is not None:
        query = query.where(MonthlyAggregate.category == category)
    query = query.order_by(MonthlyAggregate.city, MonthlyAggregate.year_month)

    rows = db.execute(query).all()
    return [MonthlyTrendOut.model_validate(row._mapping) for row in rows]


@router.get("/categories", response_model=list[CategoryTrendOut])
def get_category_trends(city: str | None = None, db: Session = Depends(get_db)) -> list[CategoryTrendOut]:
    """
    Total incidents per city per category, summed across every neighborhood and month.
    The frontend computes each category's *share* of that city's total itself (using
    GET /api/cities for the denominator) rather than this endpoint baking in a
    percentage -- keeps this endpoint reusable and the math visible to the caller.
    """
    query = (
        select(
            MonthlyAggregate.city,
            MonthlyAggregate.category,
            func.sum(MonthlyAggregate.incident_count).label("incident_count"),
        )
        .group_by(MonthlyAggregate.city, MonthlyAggregate.category)
        .order_by(MonthlyAggregate.city, MonthlyAggregate.category)
    )
    if city is not None:
        query = query.where(MonthlyAggregate.city == city)

    rows = db.execute(query).all()
    return [CategoryTrendOut.model_validate(row._mapping) for row in rows]
