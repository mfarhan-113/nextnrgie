from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional
from .. import models, schemas

def get_facture(db: Session, facture_id: int):
    return db.query(models.Facture).filter(models.Facture.id == facture_id).first()

def get_factures_by_contract(db: Session, contract_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Facture).filter(
        models.Facture.contract_id == contract_id
    ).order_by(models.Facture.created_at.desc()).offset(skip).limit(limit).all()

def update_contract_total(db: Session, contract_id: int):
    # Calculate total from all factures for this contract
    total = db.query(func.sum(models.Facture.total_ht)).filter(
        models.Facture.contract_id == contract_id
    ).scalar() or 0.0
    
    # Update the contract's price
    db_contract = db.query(models.Contract).filter(models.Contract.id == contract_id).first()
    if db_contract:
        db_contract.price = float(total)
        db.commit()
        db.refresh(db_contract)
    return db_contract

def create_facture(db: Session, facture: schemas.FactureCreate):
    # Calculate subtotal (qty * unit_price)
    subtotal = facture.qty * facture.unit_price
    
    # Calculate TVA amount
    tva_amount = subtotal * (facture.tva / 100)
    
    # Calculate total including TVA
    total_ht = subtotal + tva_amount
    
    # Create the facture with calculated total_ht
    db_facture = models.Facture(
        contract_id=facture.contract_id,
        description=facture.description,
        qty=facture.qty,
        unit_price=facture.unit_price,
        tva=facture.tva,
        total_ht=total_ht,  # This now includes TVA
        created_at=datetime.utcnow()
    )
    
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    
    # Update the contract total
    update_contract_total(db, contract_id=facture.contract_id)
    
    return db_facture

def update_facture(db: Session, facture_id: int, facture: schemas.FactureUpdate):
    db_facture = get_facture(db, facture_id)
    if not db_facture:
        return None
    
    update_data = facture.dict(exclude_unset=True)
    
    # Get current values
    qty = update_data.get('qty', db_facture.qty)
    unit_price = update_data.get('unit_price', db_facture.unit_price)
    tva_rate = update_data.get('tva', db_facture.tva) / 100  # Convert percentage to decimal
    
    # Calculate new values
    subtotal = qty * unit_price
    tva_amount = subtotal * tva_rate
    total_ht = subtotal + tva_amount
    
    # Update the facture with calculated values
    update_data['total_ht'] = total_ht
    update_data['tva'] = tva_rate * 100  # Store as percentage
    
    for field, value in update_data.items():
        setattr(db_facture, field, value)
    
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    
    # Update the contract total
    update_contract_total(db, contract_id=db_facture.contract_id)
    
    return db_facture

def delete_facture(db: Session, facture_id: int):
    db_facture = get_facture(db, facture_id)
    if not db_facture:
        return None
        
    contract_id = db_facture.contract_id
    db.delete(db_facture)
    db.commit()
    
    # Update the contract total
    update_contract_total(db, contract_id=contract_id)
    
    return db_facture