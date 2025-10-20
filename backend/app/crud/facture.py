from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
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
    
    # Get the contract
    db_contract = db.query(models.Contract).filter(models.Contract.id == contract_id).first()
    
    if db_contract:
        # Update the contract's price with the calculated total
        db_contract.price = float(total)
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)
    
    return db_contract, float(total)

def create_facture(db: Session, facture: schemas.FactureCreate):
    # Use the provided total_ht value (trust the frontend calculation)
    total_ht = facture.total_ht
    
    # Get the contract with its current total
    contract = db.query(models.Contract).filter(models.Contract.id == facture.contract_id).first()
    if not contract:
        raise ValueError(f"Contract with id {facture.contract_id} not found")
        
    # Calculate total of all existing factures for this contract
    existing_factures_total = db.query(
        func.coalesce(func.sum(models.Facture.total_ht), 0.0)
    ).filter(
        models.Facture.contract_id == facture.contract_id
    ).scalar() or 0.0
    
    # Check if adding this facture would exceed contract amount
    # Skip validation if contract price is very large (temporary PDF generation)
    contract_amount = float(contract.price or 0)
    TEMP_LARGE_PRICE = 999999
    
    if contract_amount < TEMP_LARGE_PRICE:  # Only validate if not temporary
        if existing_factures_total + total_ht > contract_amount:
            remaining = contract_amount - existing_factures_total
            raise ValueError(
                f"Cannot add facture: Total would exceed contract amount. "
                f"Remaining amount: €{remaining:.2f}, "
                f"Tried to add: €{total_ht:.2f}"
            )
    
    # Choose which invoice to link:
    # 1) If a specific invoice_id is provided, use it after validation.
    # 2) Else, use the first invoice for this contract or create one if none exists.
    invoice = None
    if getattr(facture, 'invoice_id', None):
        candidate = db.query(models.Invoice).filter(models.Invoice.id == facture.invoice_id).first()
        if not candidate:
            raise ValueError(f"Invoice with id {facture.invoice_id} not found")
        if int(candidate.contract_id) != int(facture.contract_id):
            raise ValueError("Provided invoice does not belong to the given contract")
        invoice = candidate
    else:
        invoice = db.query(models.Invoice).filter(
            models.Invoice.contract_id == facture.contract_id
        ).order_by(models.Invoice.id.asc()).first()
        # If no invoice exists, create a new one
        if not invoice:
            invoice_count = db.query(models.Invoice).count()
            invoice_number = f"INV-{invoice_count + 1:05d}"
            due_date = datetime.utcnow() + timedelta(days=30)
            
            invoice = models.Invoice(
                invoice_number=invoice_number,
                contract_id=facture.contract_id,
                amount=0,  # Will be updated below
                due_date=due_date,
                status="unpaid"
            )
            db.add(invoice)
            db.commit()
            db.refresh(invoice)
    
    # Create the facture with the provided total_ht
    db_facture = models.Facture(
        contract_id=facture.contract_id,
        invoice_id=invoice.id,
        description=facture.description,
        qty=facture.qty,
        qty_unit=facture.qty_unit,
        unit_price=facture.unit_price,
        tva=facture.tva,
        total_ht=total_ht,
        created_at=datetime.utcnow()
    )
    
    db.add(db_facture)
    db.flush()  # Flush to get the facture ID
    
    # Update the invoice amount to reflect the sum of all its factures
    invoice.amount = db.query(
        func.coalesce(func.sum(models.Facture.total_ht), 0.0)
    ).filter(
        models.Facture.invoice_id == invoice.id
    ).scalar() or 0.0

    # Preserve existing paid_amount and update status based on new amount
    current_paid = float(getattr(invoice, 'paid_amount', 0.0) or 0.0)
    if current_paid >= invoice.amount:
        invoice.status = 'paid'
    elif current_paid > 0:
        invoice.status = 'partial'
    else:
        invoice.status = 'unpaid'

    db.add(invoice)
    db.commit()
    db.refresh(db_facture)
    db.refresh(invoice)
    
    # Update contract total
    update_contract_total(db, facture.contract_id)
    
    return db_facture

def update_facture(db: Session, facture_id: int, facture: schemas.FactureUpdate):
    db_facture = get_facture(db, facture_id)
    if not db_facture:
        return None
    
    update_data = facture.dict(exclude_unset=True)
    
    # Get current values
    qty = update_data.get('qty', db_facture.qty)
    unit_price = update_data.get('unit_price', db_facture.unit_price)
    tva_rate = update_data.get('tva', db_facture.tva)
    
    # Calculate new values
    subtotal = qty * unit_price
    tva_amount = subtotal * (tva_rate / 100)  # Convert percentage to decimal for calculation
    total_ht = subtotal + tva_amount
    
    # Update the facture with calculated values
    update_data['total_ht'] = total_ht
    update_data['tva'] = tva_rate  # Keep as percentage
    
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