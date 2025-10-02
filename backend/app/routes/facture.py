from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.facture import FactureCreate, Facture, FactureUpdate
from app.models.facture import Facture as FactureModel
from app.models.contract import Contract
from sqlalchemy import select
from typing import List

router = APIRouter(prefix="/factures", tags=["factures"])

@router.get("/", response_model=List[Facture])
def get_all_factures(db: Session = Depends(get_db)):
    """Get all factures"""
    result = db.execute(select(FactureModel))
    return result.scalars().all()

@router.post("/", response_model=Facture)
def create_facture(facture: FactureCreate, db: Session = Depends(get_db)):
    # Verify contract exists
    result = db.execute(select(Contract).where(Contract.id == facture.contract_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Create facture
    db_facture = FactureModel(**facture.dict())
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    return db_facture

@router.get("/contract/{contract_id}", response_model=List[Facture])
def get_factures_by_contract(contract_id: int, db: Session = Depends(get_db)):
    # Verify contract exists
    result = db.execute(select(Contract).where(Contract.id == contract_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Get factures for contract
    result = db.execute(select(FactureModel).where(FactureModel.contract_id == contract_id))
    return result.scalars().all()

@router.get("/{facture_id}", response_model=Facture)
def get_facture(facture_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(FactureModel).where(FactureModel.id == facture_id))
    facture = result.scalars().first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture not found")
    return facture

@router.put("/{facture_id}", response_model=Facture)
def update_facture(
    facture_id: int, 
    facture_update: FactureUpdate, 
    db: Session = Depends(get_db)
):
    result = db.execute(select(FactureModel).where(FactureModel.id == facture_id))
    db_facture = result.scalars().first()
    if not db_facture:
        raise HTTPException(status_code=404, detail="Facture not found")
    
    update_data = facture_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_facture, field, value)
    
    db.commit()
    db.refresh(db_facture)
    return db_facture

@router.delete("/{facture_id}")
def delete_facture(facture_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(FactureModel).where(FactureModel.id == facture_id))
    db_facture = result.scalars().first()
    if not db_facture:
        raise HTTPException(status_code=404, detail="Facture not found")
    
    db.delete(db_facture)
    db.commit()
    return {"detail": "Facture deleted successfully"}
