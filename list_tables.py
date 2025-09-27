import psycopg2
from psycopg2 import sql

try:
    # Connect to your postgres DB
    conn = psycopg2.connect(
        dbname="nextnrgie",
        user="postgres",
        password="your_password_here",  # Replace with your actual password
        host="localhost",
        port="5432"
    )
    
    # Create a cursor object
    cur = conn.cursor()
    
    # Get all tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    # Fetch all rows
    tables = cur.fetchall()
    
    print("\nTables in the database:")
    print("-" * 50)
    for table in tables:
        print(table[0])
    
    # Close the cursor and connection
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
    print("\nPlease make sure:")
    print("1. PostgreSQL is running")
    print("2. The database 'nextnrgie' exists")
    print("3. psycopg2 is installed (pip install psycopg2-binary)")
    print("4. The database credentials are correct")
