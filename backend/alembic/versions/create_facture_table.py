"""create facture table

Revision ID: create_facture_table
Revises: 
Create Date: 2025-09-21 15:55:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'create_facture_table'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'facture',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True),
        sa.Column('contract_id', sa.Integer(), sa.ForeignKey('contracts.id'), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('qty', sa.Float(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('tva', sa.Float(), nullable=False),
        sa.Column('total_ht', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), 
                 onupdate=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )


def downgrade():
    op.drop_table('facture')
