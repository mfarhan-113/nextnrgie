from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.invoice import InvoiceCreate, InvoiceOut
from app.models.invoice import Invoice
from sqlalchemy.future import select
from typing import List

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.post("/", response_model=InvoiceOut)
async def add_invoice(invoice: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.invoice_number == invoice.invoice_number))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Invoice number already exists")
    db_invoice = Invoice(**invoice.dict())
    db.add(db_invoice)
    await db.commit()
    await db.refresh(db_invoice)
    return db_invoice

@router.get("/", response_model=List[InvoiceOut])
async def get_invoices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice))
    return result.scalars().all()

@router.put("/{invoice_id}", response_model=InvoiceOut)
async def update_invoice(
    invoice_id: int, 
    invoice_data: dict, 
    db: AsyncSession = Depends(get_db)
):
    print(f"Updating invoice {invoice_id} with data:", invoice_data)  # Debug log
    
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    db_invoice = result.scalars().first()
    
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
    
    print(f"Updated invoice - Status: {db_invoice.status}, Paid: {db_invoice.paid_amount}")  # Debug log
    
    await db.commit()
    await db.refresh(db_invoice)
    
    # Return the complete invoice data
    return db_invoice
