import pymysql
from pymysql.cursors import DictCursor

def create_facture_table():
    try:
        # Database connection parameters
        db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': '',  # Add your password here if you have one
            'database': 'nextnrgie',
            'charset': 'utf8mb4',
            'cursorclass': DictCursor
        }
        
        # Connect to MySQL
        connection = pymysql.connect(**db_config)
        print("Successfully connected to MySQL database!")
        
        try:
            with connection.cursor() as cursor:
                # Check if contracts table exists
                cursor.execute("SHOW TABLES LIKE 'contracts'")
                if not cursor.fetchone():
                    print("Error: 'contracts' table does not exist. This table is required for the foreign key.")
                    return
                
                # Create facture table
                create_table_sql = """
                CREATE TABLE IF NOT EXISTS facture (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    contract_id INT NOT NULL,
                    description TEXT NOT NULL,
                    qty FLOAT NOT NULL,
                    unit_price FLOAT NOT NULL,
                    tva FLOAT NOT NULL,
                    total_ht FLOAT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (contract_id) REFERENCES contracts(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """
                
                cursor.execute(create_table_sql)
                connection.commit()
                print("Successfully created 'facture' table!")
                
                # Verify the table was created
                cursor.execute("SHOW TABLES LIKE 'facture'")
                if cursor.fetchone():
                    print("Verification: 'facture' table exists in the database.")
                else:
                    print("Warning: Could not verify if 'facture' table was created.")
                    
        finally:
            connection.close()
            
    except pymysql.Error as e:
        print(f"Error: {e}")
        print("\nTroubleshooting steps:")
        print("1. Make sure MySQL is running")
        print("2. Check your MySQL credentials in the script")
        print("3. Verify the database 'nextnrgie' exists")
        print("4. Check if you have the necessary permissions")

if __name__ == "__main__":
    create_facture_table()
