"""add estimates table

Revision ID: 9f0a1b2c3d4e
Revises: 322e240ff999
Create Date: 2025-10-23 05:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9f0a1b2c3d4e'
down_revision = '322e240ff999'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'estimates',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('estimate_number', sa.String(length=255), nullable=False),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('clients.id'), nullable=False),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('creation_date', sa.Date(), nullable=False),
        sa.Column('expiration_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    op.create_index(op.f('ix_estimates_id'), 'estimates', ['id'], unique=False)
    op.create_unique_constraint('uq_estimates_estimate_number', 'estimates', ['estimate_number'])


def downgrade() -> None:
    op.drop_constraint('uq_estimates_estimate_number', 'estimates', type_='unique')
    op.drop_index(op.f('ix_estimates_id'), table_name='estimates')
    op.drop_table('estimates')
