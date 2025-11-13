"""Expand facture and contract detail description to TEXT

Revision ID: expand_facture_text
Revises: 9f0a1b2c3d4e_add_estimates_table
Create Date: 2025-11-13 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "expand_facture_text"
down_revision = "9f0a1b2c3d4e"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "factures",
        "description",
        existing_type=sa.String(length=255),
        type_=sa.Text(),
        existing_nullable=False,
    )

    op.alter_column(
        "contract_details",
        "description",
        existing_type=sa.String(length=255),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade():
    op.alter_column(
        "factures",
        "description",
        existing_type=sa.Text(),
        type_=sa.String(length=255),
        existing_nullable=False,
    )

    op.alter_column(
        "contract_details",
        "description",
        existing_type=sa.Text(),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
