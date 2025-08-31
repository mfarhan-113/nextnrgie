"""
Add full_name column to clients table
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('clients', sa.Column('full_name', sa.String(), nullable=False, server_default=''))
    op.alter_column('clients', 'full_name', server_default=None)

def downgrade():
    op.drop_column('clients', 'full_name')
