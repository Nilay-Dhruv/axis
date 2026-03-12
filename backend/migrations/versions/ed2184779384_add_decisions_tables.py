"""add decisions tables

Revision ID: ed2184779384
Revises: d32786a25a4f
Create Date: 2026-03-12 18:21:05.477612
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers
revision: str = "ed2184779384"
down_revision: Union[str, Sequence[str], None] = "d32786a25a4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "decisions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("outcome_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("decided_at", sa.DateTime(), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["outcome_id"], ["outcomes.id"]),
    )

    op.create_table(
        "decision_criteria",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("decision_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["decision_id"], ["decisions.id"]),
    )

    op.create_table(
        "decision_options",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("decision_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_selected", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["decision_id"], ["decisions.id"]),
    )

    op.create_table(
        "decision_scores",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("option_id", sa.Integer(), nullable=False),
        sa.Column("criteria_id", sa.Integer(), nullable=False),
        sa.Column("score", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["criteria_id"], ["decision_criteria.id"]),
        sa.ForeignKeyConstraint(["option_id"], ["decision_options.id"]),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_table("decision_scores")
    op.drop_table("decision_options")
    op.drop_table("decision_criteria")
    op.drop_table("decisions")