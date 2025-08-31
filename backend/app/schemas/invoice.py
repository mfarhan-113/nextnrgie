from pydantic import BaseModel
from typing import Optional
from datetime import date

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
    class Config:
        orm_mode = True
