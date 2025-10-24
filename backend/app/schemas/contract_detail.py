from pydantic import BaseModel
from typing import Optional

class ContractDetailBase(BaseModel):
    description: str
    qty: int
    # unite | ensemble | m
    qty_unit: str = "unite"
    unit_price: float
    tva: float
    total_ht: float

class ContractDetailCreate(ContractDetailBase):
    # Optional to allow creating items for estimates without a contract
    contract_id: Optional[int] = None
    estimate_id: Optional[int] = None

class ContractDetailUpdate(BaseModel):
    description: Optional[str] = None
    qty: Optional[int] = None
    # unite | ensemble | m
    qty_unit: Optional[str] = None
    unit_price: Optional[float] = None
    tva: Optional[float] = None
    total_ht: Optional[float] = None
    contract_id: Optional[int] = None
    # estimate_id is path-bound; ignore if provided
    estimate_id: Optional[int] = None

class ContractDetailOut(ContractDetailBase):
    id: int
    contract_id: Optional[int] = None
    estimate_id: Optional[int] = None
    
    class Config:
        from_attributes = True
