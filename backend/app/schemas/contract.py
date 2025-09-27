from pydantic import BaseModel
from typing import Optional
from datetime import date

class ClientInfo(BaseModel):
    id: int
    client_name: Optional[str] = None
    client_number: str
    email: str
    phone: str
    
    class Config:
        orm_mode = True

class ContractBase(BaseModel):
    command_number: str
    price: float
    date: date
    deadline: date
    guarantee_percentage: Optional[float] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_address: Optional[str] = None
    name: Optional[str] = None
    client_id: int

class ContractCreate(ContractBase):
    pass

class ContractOut(ContractBase):
    id: int
    client: Optional[ClientInfo] = None
    
    class Config:
        orm_mode = True
