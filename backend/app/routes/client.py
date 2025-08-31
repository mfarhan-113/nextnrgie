from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
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
async def add_client(client: ClientCreate, db: AsyncSession = Depends(get_db)):
    print(f"[add_client] Incoming data: {client.dict()}")
    
    # Check unique client number
    result = await db.execute(select(Client).where(Client.client_number == client.client_number))
    if result.scalars().first():
        print("[add_client] Conflict: client_number already exists")
        raise HTTPException(status_code=400, detail="Client number already exists")

    # Check unique email
    result = await db.execute(select(Client).where(Client.email == client.email))
    if result.scalars().first():
        print("[add_client] Conflict: email already exists")
        raise HTTPException(status_code=400, detail="Email already exists")

    db_client = Client(**client.dict())
    db.add(db_client)
    await db.commit()
    await db.refresh(db_client)
    return db_client

# Get all clients
@router.get("/", response_model=List[ClientOut])
async def get_clients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client))
    clients = result.scalars().all()
    return clients

# Get client names for dropdown
@router.get("/names")
async def get_client_names(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client.id, Client.client_name))
    return [{"id": id, "name": name} for id, name in result.all()]

# Update existing client
@router.put("/{client_id}", response_model=ClientOut)
async def update_client(
    client_id: int, 
    client: ClientCreate, 
    db: AsyncSession = Depends(get_db)
):
    print(f"[update_client] Updating client {client_id} with data: {client.dict()}")
    
    # Get existing client
    result = await db.execute(select(Client).where(Client.id == client_id))
    db_client = result.scalars().first()
    
    if not db_client:
        print(f"[update_client] Client not found: {client_id}")
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check if client_number is being changed and if it already exists
    if client.client_number != db_client.client_number:
        existing = await db.execute(select(Client).where(Client.client_number == client.client_number))
        if existing.scalars().first():
            print(f"[update_client] Client number already exists: {client.client_number}")
            raise HTTPException(status_code=400, detail="Client number already exists")
    
    # Check if email is being changed and if it already exists
    if client.email != db_client.email:
        existing = await db.execute(select(Client).where(Client.email == client.email))
        if existing.scalars().first():
            print(f"[update_client] Email already exists: {client.email}")
            raise HTTPException(status_code=400, detail="Email already exists")
    
    # Update client data
    for key, value in client.dict().items():
        setattr(db_client, key, value)
    
    await db.commit()
    await db.refresh(db_client)
    return db_client

# Delete client
@router.delete("/{client_id}")
async def delete_client(client_id: int, db: AsyncSession = Depends(get_db)):
    print(f"[delete_client] Deleting client: {client_id}")
    
    # Get client to delete
    result = await db.execute(select(Client).where(Client.id == client_id))
    db_client = result.scalars().first()
    
    if not db_client:
        print(f"[delete_client] Client not found: {client_id}")
        raise HTTPException(status_code=404, detail="Client not found")
    
    await db.delete(db_client)
    await db.commit()
    return {"message": "Client deleted successfully"}
