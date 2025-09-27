from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.schemas.contract import ContractCreate, ContractOut
from app.models.contract import Contract
from app.models.client import Client
from app.models.invoice import Invoice
from app.models.contract_detail import ContractDetail
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
        
        # Load the client relationship
        result = await db.execute(select(Contract).options(selectinload(Contract.client)).where(Contract.id == db_contract.id))
        contract_with_client = result.scalars().first()
        
        return contract_with_client
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ContractOut])
async def get_contracts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contract).options(selectinload(Contract.client)))
    contracts = result.scalars().all()
    return contracts

@router.get("/{contract_id}", response_model=ContractOut)
async def get_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contract).options(selectinload(Contract.client)).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.delete("/{contract_id}")
async def delete_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    print(f"\n=== DELETE CONTRACT REQUEST ===")
    print(f"Attempting to delete contract ID: {contract_id}")
    
    try:
        # First check if contract exists
        result = await db.execute(select(Contract).where(Contract.id == contract_id))
        contract = result.scalars().first()
        
        if contract is None:
            print(f"Contract with ID {contract_id} not found")
            raise HTTPException(status_code=404, detail="Contract not found")
        
        print(f"Found contract: ID={contract.id}, Command Number={contract.command_number}")
        
        # Check for related records that might prevent deletion
        from app.models.facture import Facture
        from app.models.contract_detail import ContractDetail
        from app.models.invoice import Invoice
        
        # Check for related factures
        factures = (await db.execute(select(Facture).where(Facture.contract_id == contract_id))).scalars().all()
        if factures:
            print(f"Found {len(factures)} related factures. Deleting them first...")
            for facture in factures:
                await db.delete(facture)
        
        # Check for related contract details
        details = (await db.execute(select(ContractDetail).where(ContractDetail.contract_id == contract_id))).scalars().all()
        if details:
            print(f"Found {len(details)} related contract details. Deleting them first...")
            for detail in details:
                await db.delete(detail)
        
        # Check for related invoices
        invoices = (await db.execute(select(Invoice).where(Invoice.contract_id == contract_id))).scalars().all()
        if invoices:
            print(f"Found {len(invoices)} related invoices. Deleting them first...")
            for invoice in invoices:
                await db.delete(invoice)
        
        # Now delete the contract
        await db.delete(contract)
        await db.commit()
        
        print(f"Successfully deleted contract ID: {contract_id}")
        return {"message": "Contract deleted successfully"}
        
    except Exception as e:
        await db.rollback()
        print(f"Error deleting contract ID {contract_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting contract: {str(e)}")

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
    
    # Load the client relationship
    result = await db.execute(select(Contract).options(selectinload(Contract.client)).where(Contract.id == contract_id))
    contract_with_client = result.scalars().first()
    
    return contract_with_client

@router.get("/{contract_id}/details")
async def get_contract_details(contract_id: int, db: AsyncSession = Depends(get_db)):
    """Get contract details (items that appear in PDF table)"""
    # First verify contract exists
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Get contract details
    result = await db.execute(select(ContractDetail).where(ContractDetail.contract_id == contract_id))
    details = result.scalars().all()
    
    # Convert to dict format for frontend
    details_list = []
    for detail in details:
        details_list.append({
            "id": detail.id,
            "description": detail.description,
            "qty": detail.qty,
            "unit_price": float(detail.unit_price),
            "tva": float(detail.tva) if detail.tva else 0.0,
            "total_ht": float(detail.total_ht)
        })
    
    return details_list
