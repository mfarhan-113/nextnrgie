"""Add contract_details table

Revision ID: 276cd7874713
Revises: 717629592bf4
Create Date: 2025-07-12 21:30:10.973588

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '276cd7874713'
down_revision: Union[str, None] = '717629592bf4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Get database connection
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if contract_items table exists and drop it if it does
    if 'contract_items' in inspector.get_table_names():
        op.drop_table('contract_items')
    
    # Create contract_details table with all required columns
    op.create_table(
        'contract_details',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, primary_key=True),
        sa.Column('contract_id', sa.Integer(), sa.ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('description', sa.String(255), nullable=False),
        sa.Column('qty', sa.Integer(), nullable=False),
        sa.Column('qty_unit', sa.String(20), server_default='unite', nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('tva', sa.Float(), nullable=False),
        sa.Column('total_ht', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), onupdate=sa.func.current_timestamp(), nullable=False),
        mysql_charset='utf8mb4',
        mysql_engine='InnoDB'
    )
    
    # Add index on contract_id for better performance
    op.create_index(op.f('ix_contract_details_contract_id'), 'contract_details', ['contract_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Get database connection
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Drop the contract_details table if it exists
    if 'contract_details' in inspector.get_table_names():
        op.drop_table('contract_details')
    
    # Recreate the old contract_items table
    op.create_table(
        'contract_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('contract_id', sa.Integer(), sa.ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('description', sa.String(255), nullable=False),
        sa.Column('qty', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('tva', sa.Float(), nullable=False),
        sa.Column('total_ht', sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        mysql_charset='utf8mb4',
        mysql_engine='InnoDB'
    )
