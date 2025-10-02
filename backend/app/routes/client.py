from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from typing import List

from app.core.database import get_db
from app.schemas.client import ClientCreate, ClientOut
from app.models.client import Client

router = APIRouter(
    prefix="/clients",
    tags=["clients"]
)

# Create new client
@router.post("/", response_model=ClientOut)
def add_client(client: ClientCreate, db: Session = Depends(get_db)):
    try:
        print(f"[add_client] Incoming data: {client.dict()}")

        # Check unique client number
        result = db.execute(select(Client).where(Client.client_number == client.client_number))
        existing_client = result.scalars().first()
        if existing_client:
            print(f"[add_client] Conflict: client_number '{client.client_number}' already exists")
            raise HTTPException(status_code=400, detail="Client number already exists")

        # Check unique email
        result = db.execute(select(Client).where(Client.email == client.email))
        existing_email = result.scalars().first()
        if existing_email:
            print(f"[add_client] Conflict: email '{client.email}' already exists")
            raise HTTPException(status_code=400, detail="Email already exists")

        print("[add_client] Creating new client...")
        db_client = Client(**client.dict())
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
        print(f"[add_client] Client created successfully with ID: {db_client.id}")

        return db_client

    except HTTPException:
        raise
    except Exception as e:
        print(f"[add_client] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Get all clients
@router.get("/", response_model=List[ClientOut])
def get_clients(db: Session = Depends(get_db)):
    result = db.execute(select(Client))
    clients = result.scalars().all()
    return clients

# Get client names for dropdown
@router.get("/names")
def get_client_names(db: Session = Depends(get_db)):
    result = db.execute(select(Client.id, Client.client_name))
    return [{"id": id, "name": name} for id, name in result.all()]

# Update existing client
@router.put("/{client_id}", response_model=ClientOut)
def update_client(
    client_id: int, 
    client: ClientCreate, 
    db: Session = Depends(get_db)
):
    print(f"[update_client] Updating client {client_id} with data: {client.dict()}")
    
    # Get existing client
    result = db.execute(select(Client).where(Client.id == client_id))
    db_client = result.scalars().first()
    
    if not db_client:
        print(f"[update_client] Client not found: {client_id}")
        raise HTTPException(status_code=404, detail="Client not found")

    # Update client data
    for key, value in client.dict().items():
        setattr(db_client, key, value)
    
    db.commit()
    db.refresh(db_client)
    print(f"[update_client] Successfully updated client {client_id}")
    return db_client

# Delete client
@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    print(f"[delete_client] Deleting client {client_id}")

    # Check if client exists
    result = db.execute(select(Client).where(Client.id == client_id))
    db_client = result.scalars().first()
    if not db_client:
        print(f"[delete_client] Client {client_id} not found")
        raise HTTPException(status_code=404, detail="Client not found")

    db.delete(db_client)
    db.commit()
    print(f"[delete_client] Successfully deleted client {client_id}")
    return {"message": "Client deleted successfully"}
