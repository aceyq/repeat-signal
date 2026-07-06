"""initial schema: neighborhoods + monthly_aggregates

Revision ID: 0001
Revises:
Create Date: 2026-07-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "neighborhoods",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        # GeoJSON geometry object -- see app/models.py for why this isn't a
        # PostGIS Geometry type (no live spatial computation happens in the DB).
        sa.Column("geometry", sa.JSON(), nullable=False),
    )
    op.create_index("ix_neighborhoods_city", "neighborhoods", ["city"])

    op.create_table(
        "monthly_aggregates",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("year_month", sa.Date(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("neighborhood_id", sa.String(), sa.ForeignKey("neighborhoods.id"), nullable=True),
        sa.Column("neighborhood_name", sa.String(), nullable=True),
        sa.Column("incident_count", sa.Integer(), nullable=False),
        sa.Column("chicago_domestic_flag_count", sa.Integer(), nullable=True),
    )
    op.create_index("ix_monthly_aggregates_city", "monthly_aggregates", ["city"])
    op.create_index("ix_monthly_aggregates_year_month", "monthly_aggregates", ["year_month"])
    op.create_index("ix_monthly_aggregates_category", "monthly_aggregates", ["category"])
    op.create_index(
        "ix_monthly_aggregates_city_category_month",
        "monthly_aggregates",
        ["city", "category", "year_month"],
    )


def downgrade() -> None:
    op.drop_table("monthly_aggregates")
    op.drop_table("neighborhoods")
