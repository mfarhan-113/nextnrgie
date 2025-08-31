"""
Remove full_name column from clients table
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.drop_column('clients', 'full_name')

def downgrade():
    op.add_column('clients', sa.Column('full_name', sa.String(), nullable=True))
