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
    # Get database connection
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Only create the table if it doesn't exist
    if 'estimates' not in inspector.get_table_names():
        op.create_table(
            'estimates',
            sa.Column('id', sa.Integer(), primary_key=True, nullable=False, autoincrement=True),
            sa.Column('estimate_number', sa.String(length=255), nullable=False),
            sa.Column('client_id', sa.Integer(), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False, index=True),
            sa.Column('amount', sa.Float(), nullable=True),
            sa.Column('status', sa.String(length=50), nullable=True),
            sa.Column('creation_date', sa.Date(), nullable=False),
            sa.Column('expiration_date', sa.Date(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
            mysql_charset='utf8mb4',
            mysql_engine='InnoDB'
        )
        
        # Create index and constraint only if they don't exist
        op.create_index(op.f('ix_estimates_id'), 'estimates', ['id'], unique=False)
        op.create_unique_constraint('uq_estimates_estimate_number', 'estimates', ['estimate_number'])
    else:
        print("Table 'estimates' already exists, skipping creation")


def downgrade() -> None:
    # Get database connection
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Only drop if the table exists
    if 'estimates' in inspector.get_table_names():
        # Drop constraint and index if they exist
        with op.batch_alter_table('estimates', schema=None) as batch_op:
            # Try to drop the constraint if it exists
            try:
                batch_op.drop_constraint('uq_estimates_estimate_number', type_='unique')
            except Exception:
                print("Constraint 'uq_estimates_estimate_number' does not exist, skipping")
            
            # Try to drop the index if it exists
            try:
                batch_op.drop_index(op.f('ix_estimates_id'))
            except Exception:
                print("Index 'ix_estimates_id' does not exist, skipping")
        
        # Drop the table
        op.drop_table('estimates')
    else:
        print("Table 'estimates' does not exist, skipping drop")
