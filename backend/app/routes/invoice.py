from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.schemas.invoice import InvoiceCreate, InvoiceOut
from app.models.invoice import Invoice
from app.models.contract import Contract
from app.models.client import Client
from app.models.facture import Facture

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.post("/", response_model=InvoiceOut)
def add_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    # Check if invoice number already exists
    if db.query(Invoice).filter(Invoice.invoice_number == invoice.invoice_number).first():
        raise HTTPException(status_code=400, detail="Invoice number already exists")
    
    # Create new invoice
    db_invoice = Invoice(**invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    # Note: If caller wants to set a custom created_at (issue date), they must call PUT after POST.
    return db_invoice

@router.get("/", response_model=List[InvoiceOut])
def get_invoices(db: Session = Depends(get_db)):
    try:
        # Query invoices with related contract, client, and factures data
        invoices_data = db.query(Invoice)\
            .options(
                joinedload(Invoice.contract)
                .joinedload(Contract.client),
                joinedload(Invoice.factures)
            )\
            .all()
        
        invoices = []
        for invoice in invoices_data:
            # Use persisted paid_amount from DB (defaults to 0.0 if None)
            paid_amount = float(getattr(invoice, 'paid_amount', 0.0) or 0.0)

            # Derive amount from sum of related factures to avoid stale data
            factures_total = 0.0
            if hasattr(invoice, 'factures') and invoice.factures:
                factures_total = float(sum((f.total_ht or 0.0) for f in invoice.factures))

            # Keep backend status as-is (default to unpaid if missing)
            status = invoice.status or 'unpaid'

            invoice_dict = {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'contract_id': invoice.contract_id,
                'amount': factures_total,
                'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
                'status': status,
                'paid_amount': paid_amount,
                'created_at': invoice.created_at.isoformat() if invoice.created_at else None,
                'client_name': None,
                'client_id': None,
                'contract_number': None
            }
            
            # Add client and contract data if available
            if hasattr(invoice, 'contract') and invoice.contract:
                contract = invoice.contract
                invoice_dict['contract_number'] = contract.command_number
                invoice_dict['contract_id'] = contract.id
                
                if hasattr(contract, 'client') and contract.client:
                    client = contract.client
                    invoice_dict['client_name'] = client.client_name
                    invoice_dict['client_id'] = client.id
            
            invoices.append(invoice_dict)

        return invoices
        
    except Exception as e:
        import traceback
        print(f"Error in get_invoices: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{invoice_id}", response_model=InvoiceOut)
def update_invoice(
    invoice_id: int, 
    invoice_data: dict, 
    db: Session = Depends(get_db)
):
    print(f"Updating invoice {invoice_id} with data:", invoice_data)  # Debug log
    
    # Get the invoice
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Store current values for comparison
    current_status = getattr(db_invoice, 'status', None)
    current_paid = getattr(db_invoice, 'paid_amount', 0)
    
    # Update status if provided
    if 'status' in invoice_data:
        new_status = invoice_data['status']
        setattr(db_invoice, 'status', new_status)
        
        # Update paid_amount based on status
        if new_status == 'paid':
            db_invoice.paid_amount = db_invoice.amount
        elif new_status == 'unpaid':
            db_invoice.paid_amount = 0
        elif new_status == 'partial' and 'paid_amount' not in invoice_data:
            db_invoice.paid_amount = db_invoice.amount / 2
    
    # Update paid_amount if explicitly provided (overrides status-based logic)
    if 'paid_amount' in invoice_data:
        db_invoice.paid_amount = min(max(0, float(invoice_data['paid_amount'])), db_invoice.amount)
    
    # If status wasn't provided but paid_amount was, update status accordingly
    if 'status' not in invoice_data and 'paid_amount' in invoice_data:
        paid_amount = float(invoice_data['paid_amount'])
        if paid_amount >= db_invoice.amount:
            db_invoice.status = 'paid'
        elif paid_amount > 0:
            db_invoice.status = 'partial'
        else:
            db_invoice.status = 'unpaid'

    # Update invoice_number if provided
    if 'invoice_number' in invoice_data:
        new_number = invoice_data['invoice_number']
        if not isinstance(new_number, str) or not new_number.strip():
            raise HTTPException(status_code=422, detail="Invalid invoice_number")
        db_invoice.invoice_number = new_number.strip()

    # Update due_date if provided (accept 'YYYY-MM-DD' string)
    if 'due_date' in invoice_data and invoice_data['due_date']:
        try:
            if isinstance(invoice_data['due_date'], str):
                db_invoice.due_date = datetime.strptime(invoice_data['due_date'], '%Y-%m-%d').date()
            else:
                db_invoice.due_date = invoice_data['due_date']
        except Exception:
            raise HTTPException(status_code=422, detail="Invalid due_date format, expected YYYY-MM-DD")

    # Update created_at if provided (treats as issue date). Accept 'created_at' or 'issue_date' keys in 'YYYY-MM-DD'.
    created_key = None
    if 'created_at' in invoice_data:
        created_key = 'created_at'
    elif 'issue_date' in invoice_data:
        created_key = 'issue_date'
    if created_key and invoice_data.get(created_key):
        try:
            if isinstance(invoice_data[created_key], str):
                # set time to 00:00:00 for consistency
                dt = datetime.strptime(invoice_data[created_key], '%Y-%m-%d')
            else:
                dt = invoice_data[created_key]
            db_invoice.created_at = dt
        except Exception:
            raise HTTPException(status_code=422, detail="Invalid issue date format, expected YYYY-MM-DD")

    print(f"Updated invoice - Status: {db_invoice.status}, Paid: {db_invoice.paid_amount}")  # Debug log
    
    # Save changes to the database
    try:
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        
        # If status changed to paid, update related contract
        if current_status != 'paid' and db_invoice.status == 'paid':
            # Find the contract and mark it as paid
            contract = db.query(Contract).filter(Contract.id == db_invoice.contract_id).first()
            if contract:
                contract.status = 'paid'
                db.add(contract)
                db.commit()
        
        # If paid amount changed, update related factures or other logic
        if current_paid != db_invoice.paid_amount:
            # Add your logic here for handling paid amount changes
            pass
            
        return db_invoice
        
    except IntegrityError as e:
        db.rollback()
        # Likely unique constraint on invoice_number
        raise HTTPException(status_code=400, detail="Invoice number already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating invoice: {str(e)}")
    finally:
        db.close()

@router.delete("/{invoice_id}", status_code=204)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """Delete an invoice and its related factures to keep DB consistent."""
    try:
        db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not db_invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Delete related factures first to avoid FK issues
        db.query(Facture).filter(Facture.invoice_id == invoice_id).delete(synchronize_session=False)

        # Delete the invoice itself
        db.delete(db_invoice)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting invoice: {str(e)}")
