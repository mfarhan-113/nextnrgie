from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def check_contract_columns():
    # Create engine
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URL)
    
    # Create a configured "Session" class
    Session = sessionmaker(bind=engine)
    
    # Create a Session
    session = Session()
    
    try:
        # Get table information
        inspector = inspect(engine)
        columns = inspector.get_columns('contracts')
        
        print("\nColumns in 'contracts' table:")
        print("-" * 50)
        for column in columns:
            print(f"Name: {column['name']}, Type: {column['type']}")
            
        # Check for our new columns
        new_columns = ['contact_phone', 'contact_email', 'contact_address']
        existing_columns = [col['name'] for col in columns]
        
        print("\nChecking for new columns:")
        print("-" * 50)
        for col in new_columns:
            status = "FOUND" if col in existing_columns else "MISSING"
            print(f"{col}: {status}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    check_contract_columns()
