"""
SQLAlchemy ORM models. These mirror the two small tables produced by the data
pipeline (see ../docs/PIPELINE.md) -- this backend is a read-mostly API over
data prepared entirely offline, not a live transactional system (see
../docs/ARCHITECTURE.md).

Neighborhood boundaries are stored as plain GeoJSON (a JSON column), not a
PostGIS Geometry type. All spatial computation (the point-in-polygon join)
already happened offline in the Milestone 2 pipeline -- the database only
needs to store and return precomputed boundaries for the map, never compute
anything spatial itself, so PostGIS's live geospatial-query engine isn't
needed here (and pulls in a heavy GDAL/PostGIS build on some platforms).
"""

from datetime import date

from sqlalchemy import JSON, Date, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Neighborhood(Base):
    __tablename__ = "neighborhoods"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    city: Mapped[str] = mapped_column(String, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    geometry: Mapped[dict] = mapped_column(JSON, nullable=False)  # GeoJSON geometry object

    aggregates: Mapped[list["MonthlyAggregate"]] = relationship(back_populates="neighborhood")


class MonthlyAggregate(Base):
    __tablename__ = "monthly_aggregates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    city: Mapped[str] = mapped_column(String, index=True, nullable=False)
    year_month: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String, index=True, nullable=False)
    neighborhood_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("neighborhoods.id"), nullable=True
    )
    neighborhood_name: Mapped[str | None] = mapped_column(String, nullable=True)
    incident_count: Mapped[int] = mapped_column(Integer, nullable=False)
    # Only meaningful for city == "chicago" -- see docs/DATA_DICTIONARY.md and
    # docs/ETHICS.md on why this signal isn't comparable across cities.
    chicago_domestic_flag_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    neighborhood: Mapped["Neighborhood | None"] = relationship(back_populates="aggregates")

    __table_args__ = (
        Index("ix_monthly_aggregates_city_category_month", "city", "category", "year_month"),
    )
