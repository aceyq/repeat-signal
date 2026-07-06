"""Pydantic response models -- the API's typed public contract."""

from datetime import date
from typing import Any

from pydantic import BaseModel, ConfigDict


class NeighborhoodOut(BaseModel):
    """Lightweight neighborhood listing -- no geometry (kept out of list responses
    since 380 polygons' worth of coordinates is unnecessary payload for a picker)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    city: str
    name: str


class NeighborhoodDetailOut(NeighborhoodOut):
    """Single-neighborhood lookup, includes geometry as GeoJSON for map rendering."""

    geometry: dict[str, Any]


class AggregateRowOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    city: str
    year_month: date
    category: str
    neighborhood_id: str | None
    neighborhood_name: str | None
    incident_count: int
    chicago_domestic_flag_count: int | None


class CityOut(BaseModel):
    city: str
    incident_count: int
    date_range_start: date
    date_range_end: date


class CategoryOut(BaseModel):
    category: str
    incident_count: int


class SummaryOut(BaseModel):
    total_incidents: int
    date_range_start: date
    date_range_end: date
    cities: list[CityOut]
