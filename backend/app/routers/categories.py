from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MonthlyAggregate
from app.schemas import CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryOut]:
    """Shared taxonomy categories present in the data, with total incident counts.

    See scripts/category_mapping.py for how each city's raw category label maps here.
    """
    rows = db.execute(
        select(
            MonthlyAggregate.category,
            func.sum(MonthlyAggregate.incident_count).label("incident_count"),
        )
        .group_by(MonthlyAggregate.category)
        .order_by(func.sum(MonthlyAggregate.incident_count).desc())
    ).all()
    return [CategoryOut.model_validate(row._mapping) for row in rows]
