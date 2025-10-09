from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.contract_detail import ContractDetailCreate, ContractDetailOut
from app.models.contract_detail import ContractDetail
from app.models.contract import Contract
from typing import List

router = APIRouter(prefix="/contract-details", tags=["contract-details"])

@router.post("/", response_model=ContractDetailOut)
def add_contract_detail(detail: ContractDetailCreate, db: Session = Depends(get_db)):
    # Verify contract exists
    contract = db.query(Contract).filter(Contract.id == detail.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Create contract detail
    db_detail = ContractDetail(**detail.dict())
    db.add(db_detail)
    db.commit()
    db.refresh(db_detail)
    
    return db_detail

@router.get("/contracts/{contract_id}", response_model=List[ContractDetailOut])
def get_contract_details(contract_id: int, db: Session = Depends(get_db)):
    # Verify contract exists
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Get contract details
    details = db.query(ContractDetail).filter(ContractDetail.contract_id == contract_id).all()
    return details

@router.delete("/{detail_id}")
def delete_contract_detail(detail_id: int, db: Session = Depends(get_db)):
    db_detail = db.query(ContractDetail).filter(ContractDetail.id == detail_id).first()
    if not db_detail:
        raise HTTPException(status_code=404, detail="Contract detail not found")
    db.delete(db_detail)
    db.commit()
    return {"detail": "Contract detail deleted successfully"}

@router.delete("/contract/{contract_id}")
def delete_contract_details_by_contract(contract_id: int, db: Session = Depends(get_db)):
    # Get all contract details for this contract
    details = db.query(ContractDetail).filter(ContractDetail.contract_id == contract_id).all()
    
    # Delete all
    for detail in details:
        db.delete(detail)
    
    db.commit()
    return {"detail": f"Deleted {len(details)} contract details"}
