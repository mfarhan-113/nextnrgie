from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.schemas.contract import ContractCreate, ContractOut
from app.models.contract import Contract
from app.models.invoice import Invoice
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/contracts", tags=["contracts"])

@router.post("/", response_model=ContractOut)
async def add_contract(contract: ContractCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Generate a command number if empty
        if not contract.command_number or not contract.command_number.strip():
            current_date = datetime.now()
            contract.command_number = f"CMD-{current_date.strftime('%Y%m%d')}-{current_date.strftime('%H%M%S')}"
        # Check if command number exists
        else:
            result = await db.execute(select(Contract).where(Contract.command_number == contract.command_number))
            existing_contract = result.scalars().first()
            if existing_contract:
                # Generate a unique command number with timestamp to avoid conflicts
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                contract.command_number = f"{contract.command_number}-{timestamp}"
        
        # Create contract
        db_contract = Contract(**contract.dict())
        db.add(db_contract)
        await db.commit()
        await db.refresh(db_contract)
        
        # Create invoice for the contract
        current_date = datetime.now().date()
        due_date = contract.deadline or current_date + timedelta(days=30)
        
        invoice = Invoice(
            invoice_number=f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            contract_id=db_contract.id,
            amount=contract.price,
            due_date=due_date,
            status='unpaid'
        )
        db.add(invoice)
        await db.commit()
        
        # Refresh to get relationships
        await db.refresh(db_contract)
        return db_contract
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ContractOut])
async def get_contracts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contract))
    contracts = result.scalars().all()
    return contracts

@router.get("/{contract_id}", response_model=ContractOut)
async def get_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.delete("/{contract_id}")
async def delete_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    await db.delete(contract)
    await db.commit()
    return {"message": "Contract deleted successfully"}

@router.put("/{contract_id}", response_model=ContractOut)
async def update_contract(contract_id: int, contract: ContractCreate, db: AsyncSession = Depends(get_db)):
    # Get existing contract
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    db_contract = result.scalars().first()
    
    if db_contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check if command number is being changed and if it already exists
    if contract.command_number != db_contract.command_number:
        result = await db.execute(select(Contract).where(Contract.command_number == contract.command_number))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Command number already exists")
    
    # Update contract data
    for key, value in contract.dict().items():
        setattr(db_contract, key, value)
    
    await db.commit()
    await db.refresh(db_contract)
    return db_contract
