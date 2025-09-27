import psycopg2
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
import os

def check_tables():
    try:
        # Get database URL from environment variable or use default
        DATABASE_URL = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:your_password@localhost:5432/nextnrgie"
        )
        
        # Create engine and connect to the database
        engine = create_engine(DATABASE_URL)
        connection = engine.connect()
        
        # Get the inspector
        inspector = inspect(engine)
        
        # Get list of tables
        tables = inspector.get_table_names()
        
        print("\nTables in the database:")
        print("-" * 50)
        for table in tables:
            print(f"- {table}")
            
            # Get columns for each table
            columns = inspector.get_columns(table)
            for column in columns:
                print(f"  - {column['name']} ({column['type']})")
            print()
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    check_tables()
