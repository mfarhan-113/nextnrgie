from pydantic import BaseModel
from typing import Optional

class ContractDetailBase(BaseModel):
    description: str
    qty: int
    unit_price: float
    tva: float
    total_ht: float

class ContractDetailCreate(ContractDetailBase):
    contract_id: int

class ContractDetailOut(ContractDetailBase):
    id: int
    contract_id: int
    
    class Config:
        orm_mode = True
