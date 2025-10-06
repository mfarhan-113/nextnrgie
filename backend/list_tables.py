import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, MetaData
from app.core.database import Base

# List all tables that should be created
print("Tables defined in Base.metadata:")
for table_name, table in Base.metadata.tables.items():
    print(f"- {table_name}")
