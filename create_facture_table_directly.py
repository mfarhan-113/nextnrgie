import os
from sqlalchemy import create_engine, text

def create_facture_table():
    try:
        # Get database URL from environment variable or use default
        DATABASE_URL = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:your_password@localhost:5432/nextnrgie"
        )
        
        print(f"Connecting to database: {DATABASE_URL.split('@')[-1]}")
        engine = create_engine(DATABASE_URL)
        
        # SQL to create the facture table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS facture (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER NOT NULL REFERENCES contracts(id),
            description TEXT NOT NULL,
            qty FLOAT NOT NULL,
            unit_price FLOAT NOT NULL,
            tva FLOAT NOT NULL,
            total_ht FLOAT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """
        
        with engine.connect() as connection:
            # Create the table
            print("Creating facture table...")
            connection.execute(text(create_table_sql))
            connection.commit()
            print("Table 'facture' created successfully!")
            
            # Verify the table was created
            result = connection.execute(
                text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'facture'
                """)
            )
            
            if result.fetchone():
                print("Verification: 'facture' table exists in the database.")
            else:
                print("Warning: Could not verify if 'facture' table was created.")
                
    except Exception as e:
        print(f"Error: {e}")
        print("\nTroubleshooting steps:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your database credentials in the script")
        print("3. Verify the database 'nextnrgie' exists")
        print("4. Check if you have the necessary permissions")

if __name__ == "__main__":
    create_facture_table()
