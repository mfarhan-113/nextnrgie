from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
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
def add_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    try:
        # Generate a contract number if empty
        if not contract.command_number or not contract.command_number.strip():
            current_date = datetime.now()
            contract.command_number = f"CON-{current_date.strftime('%Y%m%d')}-{current_date.strftime('%H%M%S')}"
        # Check if contract number exists
        else:
            result = db.execute(select(Contract).where(Contract.command_number == contract.command_number))
            existing_contract = result.scalars().first()
            if existing_contract:
                # Generate a unique contract number with timestamp to avoid conflicts
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                contract.command_number = f"{contract.command_number}-{timestamp}"
        
        # Verify client exists
        result = db.execute(select(Client).where(Client.id == contract.client_id))
        if not result.scalars().first():
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Create contract
        contract_data = contract.dict()
        db_contract = Contract(**contract_data)
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)
        
        # Fetch the complete contract with client info
        result = db.execute(select(Contract).where(Contract.id == db_contract.id))
        complete_contract = result.scalars().first()
        
        return complete_contract

    except HTTPException:
        raise
    except Exception as e:
        print(f"[add_contract] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[ContractOut])
def get_contracts(db: Session = Depends(get_db)):
    result = db.execute(select(Contract))
    contracts = result.scalars().all()
    return contracts

@router.get("/{contract_id}", response_model=ContractOut)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.delete("/{contract_id}")
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    print(f"\n=== DELETE CONTRACT REQUEST ===")
    print(f"Attempting to delete contract ID: {contract_id}")
    
    try:
        # First check if contract exists
        result = db.execute(select(Contract).where(Contract.id == contract_id))
        contract = result.scalars().first()
        
        if contract is None:
            print(f"Contract with ID {contract_id} not found")
            raise HTTPException(status_code=404, detail="Contract not found")
        
        print(f"Found contract: ID={contract.id}, Contract Number={contract.command_number}")
        
        # Check for related records that might prevent deletion
        from app.models.facture import Facture
        from app.models.contract_detail import ContractDetail
        from app.models.invoice import Invoice
        
        # Check for related factures
        factures = db.execute(select(Facture).where(Facture.contract_id == contract_id)).scalars().all()
        if factures:
            print(f"Found {len(factures)} related factures. Deleting them first...")
            for facture in factures:
                db.delete(facture)
        
        # Check for related contract details
        details = db.execute(select(ContractDetail).where(ContractDetail.contract_id == contract_id)).scalars().all()
        if details:
            print(f"Found {len(details)} related contract details. Deleting them first...")
            for detail in details:
                db.delete(detail)
        
        # Check for related invoices
        invoices = db.execute(select(Invoice).where(Invoice.contract_id == contract_id)).scalars().all()
        if invoices:
            print(f"Found {len(invoices)} related invoices. Deleting them first...")
            for invoice in invoices:
                db.delete(invoice)
        
        # Now delete the contract
        db.delete(contract)
        db.commit()
        
        print(f"Successfully deleted contract ID: {contract_id}")
        return {"message": "Contract deleted successfully"}
        
    except Exception as e:
        db.rollback()
        print(f"Error deleting contract ID {contract_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting contract: {str(e)}")

@router.put("/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, contract: ContractCreate, db: Session = Depends(get_db)):
    # Get existing contract
    result = db.execute(select(Contract).where(Contract.id == contract_id))
    db_contract = result.scalars().first()
    
    if db_contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check if contract number is being changed and if it already exists
    if contract.command_number != db_contract.command_number:
        result = db.execute(select(Contract).where(Contract.command_number == contract.command_number))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Contract number already exists")
    
    # Update contract data
    update_data = contract.dict()

    for key, value in update_data.items():
        setattr(db_contract, key, value)
    
    db.commit()
    db.refresh(db_contract)
    
    return db_contract

@router.get("/{contract_id}/details")
def get_contract_details(contract_id: int, db: Session = Depends(get_db)):
    """Get contract details (items that appear in PDF table)"""
    # First verify contract exists
    result = db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if contract is None:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Get contract details
    result = db.execute(select(ContractDetail).where(ContractDetail.contract_id == contract_id))
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
