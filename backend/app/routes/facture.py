from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud
from ..core.database import get_db

router = APIRouter(prefix="/factures", tags=["factures"])

@router.post("/", response_model=schemas.Facture, status_code=status.HTTP_201_CREATED)
def create_facture(facture: schemas.FactureCreate, db: Session = Depends(get_db)):
    """
    Create a new facture.
    """
    # Verify contract exists
    db_contract = db.query(models.Contract).filter(models.Contract.id == facture.contract_id).first()
    if not db_contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract with id {facture.contract_id} not found"
        )
    
    # Create the facture
    db_facture = crud.create_facture(db=db, facture=facture)
    return db_facture

@router.get("/{facture_id}", response_model=schemas.Facture)
def read_facture(facture_id: int, db: Session = Depends(get_db)):
    """
    Get a specific facture by ID.
    """
    db_facture = crud.get_facture(db, facture_id=facture_id)
    if db_facture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facture with id {facture_id} not found"
        )
    return db_facture

@router.get("/contract/{contract_id}", response_model=List[schemas.Facture])
def read_factures_by_contract(
    contract_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Get all factures for a specific contract.
    Returns an empty list if no factures are found.
    """
    # Verify contract exists
    db_contract = db.query(models.Contract).filter(models.Contract.id == contract_id).first()
    if not db_contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract with id {contract_id} not found"
        )
        
    factures = crud.get_factures_by_contract(
        db, contract_id=contract_id, skip=skip, limit=limit
    )
    
    # Return empty list if no factures found (no 404 error)
    return factures or []

@router.delete("/{facture_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_facture(facture_id: int, db: Session = Depends(get_db)):
    """
    Delete a facture.
    """
    db_facture = crud.delete_facture(db, facture_id=facture_id)
    if db_facture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facture with id {facture_id} not found"
        )
    return None