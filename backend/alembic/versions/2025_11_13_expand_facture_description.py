"""Expand facture description to TEXT

Revision ID: 2025_11_13_expand_facture_description
Revises: 2025_10_24_make_contract_id_nullable
Create Date: 2025-11-13 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2025_11_13_expand_facture_description'
down_revision = '2025_10_24_make_contract_id_nullable'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        'factures',
        'description',
        existing_type=sa.String(length=255),
        type_=sa.Text(),
        existing_nullable=False
    )

    op.alter_column(
        'contract_details',
        'description',
        existing_type=sa.String(length=255),
        type_=sa.Text(),
        existing_nullable=False
    )


def downgrade():
    op.alter_column(
        'factures',
        'description',
        existing_type=sa.Text(),
        type_=sa.String(length=255),
        existing_nullable=False
    )

    op.alter_column(
        'contract_details',
        'description',
        existing_type=sa.Text(),
        type_=sa.String(length=255),
        existing_nullable=False
    )
