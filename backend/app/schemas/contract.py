from pydantic import BaseModel
from typing import Optional
from datetime import date

class ContractBase(BaseModel):
    command_number: str
    price: float
    date: date
    deadline: date
    guarantee_percentage: Optional[float] = None
    contact_person: Optional[str] = None
    name: Optional[str] = None
    client_id: int

class ContractCreate(ContractBase):
    pass

class ContractOut(ContractBase):
    id: int
    class Config:
        orm_mode = True
