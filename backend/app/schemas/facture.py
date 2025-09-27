from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class FactureBase(BaseModel):
    contract_id: int
    description: str
    qty: float = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    tva: float = Field(..., ge=0, le=100)
    total_ht: float = Field(..., gt=0)

class FactureCreate(FactureBase):
    pass

class FactureUpdate(BaseModel):
    description: Optional[str] = None
    qty: Optional[float] = Field(None, gt=0)
    unit_price: Optional[float] = Field(None, gt=0)
    tva: Optional[float] = Field(None, ge=0, le=100)
    total_ht: Optional[float] = Field(None, gt=0)

class FactureInDBBase(FactureBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Facture(FactureInDBBase):
    pass
