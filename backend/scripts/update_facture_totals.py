from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.facture import Facture

def update_facture_totals():
    # Create database engine with the correct settings attribute
    SQLALCHEMY_DATABASE_URL = settings.SQLALCHEMY_DATABASE_URL
    print(f"Connecting to database: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get all factures
        factures = db.query(Facture).all()
        
        # Update each facture
        for facture in factures:
            # Calculate the correct total_ht including TVA
            subtotal = facture.qty * facture.unit_price
            tva_amount = subtotal * (facture.tva / 100)
            correct_total = subtotal + tva_amount
            
            # Update the facture
            facture.total_ht = round(correct_total, 2)
            print(f"Updated facture {facture.id}: {facture.qty} x {facture.unit_price} + {facture.tva}% = {facture.total_ht}")
        
        # Commit the changes
        db.commit()
        print("Successfully updated all facture totals")
        
    except Exception as e:
        db.rollback()
        print(f"Error updating facture totals: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_facture_totals()
