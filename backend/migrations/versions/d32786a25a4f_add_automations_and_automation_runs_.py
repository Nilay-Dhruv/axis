"""add automations and automation_runs tables

Revision ID: d32786a25a4f
Revises: 5de329311947
Create Date: 2026-03-12 18:13:07.847877
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "d32786a25a4f"
down_revision: Union[str, Sequence[str], None] = "5de329311947"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "automations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("trigger", sa.String(length=100), nullable=False),
        sa.Column("condition", sa.JSON(), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("action_config", sa.JSON(), nullable=True),
        sa.Column("is_enabled", sa.Boolean(), nullable=True),
        sa.Column("run_count", sa.Integer(), nullable=True),
        sa.Column("last_run_at", sa.DateTime(), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
    )

    op.create_table(
        "automation_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("automation_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("detail", sa.Text(), nullable=True),
        sa.Column("ran_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["automation_id"], ["automations.id"]),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_table("automation_runs")
    op.drop_table("automations")