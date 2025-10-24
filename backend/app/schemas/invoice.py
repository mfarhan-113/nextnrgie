from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class InvoiceBase(BaseModel):
    invoice_number: str
    contract_id: int
    amount: float
    due_date: date
    status: Optional[str] = "unpaid"

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceOut(InvoiceBase):
    id: int
    client_id: Optional[int] = None
    client_name: Optional[str] = None
    contract_id: int
    contract_number: Optional[str] = None
    paid_amount: Optional[float] = 0.0
    # Include created_at so frontend can use it as issue_date after reload
    created_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        from_attributes = True  # For Pydantic v2 compatibility
