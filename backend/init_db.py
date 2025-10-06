import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import after setting up the path
from app.core.database import Base, engine
from app.models import *  # This imports all models

def init_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    # List all created tables
    print("\nTables created:")
    for table_name in Base.metadata.tables.keys():
        print(f"- {table_name}")

if __name__ == "__main__":
    init_db()
