"""Make contract_id nullable on contract_details

Revision ID: 2025_10_24_make_contract_id_nullable
Revises: 2023_10_23_add_estimate_id_to_contract_details
Create Date: 2025-10-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2025_10_24_make_contract_id_nullable'
down_revision = '2023_10_23_add_estimate_id_to_contract_details'
branch_labels = None
depends_on = None

def upgrade():
    # Relax NOT NULL to allow estimate-only items
    op.alter_column(
        'contract_details',
        'contract_id',
        existing_type=sa.Integer(),
        nullable=True,
        existing_nullable=False
    )


def downgrade():
    # Revert to NOT NULL
    op.alter_column(
        'contract_details',
        'contract_id',
        existing_type=sa.Integer(),
        nullable=False,
        existing_nullable=True
    )
