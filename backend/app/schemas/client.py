from pydantic import BaseModel, EmailStr
from typing import Optional

class ClientBase(BaseModel):
    client_number: str
    client_name: Optional[str] = None
    email: EmailStr
    phone: str
    tva_number: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientOut(ClientBase):
    id: int
    class Config:
        orm_mode = True
