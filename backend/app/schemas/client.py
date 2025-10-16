from pydantic import BaseModel, EmailStr
from typing import Optional

class ClientBase(BaseModel):
    client_number: str
    client_name: Optional[str] = None
    email: EmailStr
    phone: str
    tva_number: Optional[str] = None
    tsa_number: Optional[str] = None
    contact_person: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_designation: Optional[str] = None
    client_address: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientOut(ClientBase):
    id: int
    class Config:
        # Pydantic v2 compatibility: enable ORM object serialization
        # FastAPI still reads orm_mode, but from_attributes is required in v2
        from_attributes = True
        orm_mode = True
