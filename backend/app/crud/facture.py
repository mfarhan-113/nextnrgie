from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional

def get_facture(db: Session, facture_id: int):
    return db.query(models.Facture).filter(models.Facture.id == facture_id).first()

def get_factures_by_contract(db: Session, contract_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Facture).filter(
        models.Facture.contract_id == contract_id
    ).offset(skip).limit(limit).all()

def create_facture(db: Session, facture: schemas.FactureCreate):
    db_facture = models.Facture(**facture.dict())
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    return db_facture

def update_facture(db: Session, facture_id: int, facture_update: schemas.FactureUpdate):
    db_facture = get_facture(db, facture_id)
    if not db_facture:
        return None
    
    update_data = facture_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_facture, field, value)
    
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    return db_facture

def delete_facture(db: Session, facture_id: int):
    db_facture = get_facture(db, facture_id)
    if db_facture:
        db.delete(db_facture)
        db.commit()
    return db_facture
