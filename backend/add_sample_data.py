from app.core.database import SessionLocal
from app.models import User, Client, Contract
from datetime import datetime, timedelta

def add_sample_data():
    db = SessionLocal()
    
    # Sample user (matches your User schema)
    user_data = {
        "email": "admin@nextnrgie.fr",
        "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Leehbtl/FuMVj7kW",  # "password"
        "full_name": "Admin User",
        "phone": "+33123456789"
    }
    
    # Sample clients (matches your Client schema)
    clients_data = [
        {
            "client_number": "CLT-001",
            "client_name": "ABC Corporation",
            "email": "contact@abccorp.com",
            "phone": "+33123456789",
            "tva_number": "FR123456789",
            "tsa_number": "TSA987654321",
            "contact_person": "Jean Dupont",
            "contact_person_phone": "+33123456789",
            "contact_person_designation": "CEO",
            "client_address": "123 Avenue des Champs-Élysées, 75008 Paris",
            "owner_id": 1  # Will be set after user creation
        },
        {
            "client_number": "CLT-002", 
            "client_name": "Tech Solutions Ltd",
            "email": "info@techsolutions.fr",
            "phone": "+33987654321",
            "tva_number": "FR987654321",
            "tsa_number": "TSA123456789",
            "contact_person": "Marie Martin",
            "contact_person_phone": "+33987654321",
            "contact_person_designation": "CTO",
            "client_address": "456 Rue de la République, 69000 Lyon",
            "owner_id": 1  # Will be set after user creation
        }
    ]
    
    # Sample contracts (matches your Contract schema)
    contracts_data = [
        {
            "command_number": "CMD-2025-001",
            "price": 15000.50,
            "date": datetime.now().date(),
            "deadline": datetime.now().date() + timedelta(days=30),
            "guarantee_percentage": 10.0,
            "contact_person": "Pierre Durand",
            "contact_phone": "+33111222333",
            "contact_email": "pierre.durand@abccorp.com",
            "contact_address": "123 Avenue des Champs-Élysées, 75008 Paris",
            "name": "Website Development Contract",
            "client_id": 1  # Will be set after client creation
        },
        {
            "command_number": "CMD-2025-002",
            "price": 25000.75,
            "date": datetime.now().date(),
            "deadline": datetime.now().date() + timedelta(days=45),
            "guarantee_percentage": 15.0,
            "contact_person": "Sophie Moreau",
            "contact_phone": "+33444555666",
            "contact_email": "sophie.moreau@techsolutions.fr",
            "contact_address": "456 Rue de la République, 69000 Lyon",
            "name": "Mobile App Development",
            "client_id": 2  # Will be set after client creation
        }
    ]
    
    try:
        # Add user first
        user = User(**user_data)
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id
        print(f"✅ User created with ID: {user_id}")
        
        # Update clients with correct owner_id
        for client_data in clients_data:
            client_data["owner_id"] = user_id
            client = Client(**client_data)
            db.add(client)
        
        db.commit()
        
        # Get client IDs for contracts
        clients = db.query(Client).all()
        client_id_map = {client.client_number: client.id for client in clients}
        
        # Update contracts with correct client_id
        for contract_data in contracts_data:
            client_number = contract_data["command_number"].replace("CMD-2025-00", "CLT-00")
            if client_number == "CMD-2025-001":
                contract_data["client_id"] = client_id_map.get("CLT-001", 1)
            elif client_number == "CMD-2025-002":
                contract_data["client_id"] = client_id_map.get("CLT-002", 2)
            
            contract = Contract(**contract_data)
            db.add(contract)
            
        db.commit()
        
        print("✅ Sample data added successfully!")
        print(f"Added 1 user, {len(clients_data)} clients and {len(contracts_data)} contracts")
        
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()
