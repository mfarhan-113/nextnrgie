"""Add estimate_id to contract_details

Revision ID: 2023_10_23_add_estimate_id_to_contract_details
Revises: 
Create Date: 2023-10-23 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2023_10_23_add_estimate_id_to_contract_details'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add estimate_id column to contract_details table
    op.add_column('contract_details', 
                 sa.Column('estimate_id', sa.Integer(), nullable=True))
    
    # Create foreign key constraint with CASCADE delete
    op.create_foreign_key(
        'fk_contract_details_estimate_id',
        'contract_details', 'estimates',
        ['estimate_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade():
    # Drop the foreign key constraint first
    op.drop_constraint('fk_contract_details_estimate_id', 'contract_details', type_='foreignkey')
    
    # Then drop the column
    op.drop_column('contract_details', 'estimate_id')
