from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class EstimateBase(BaseModel):
    estimate_number: str
    client_id: int
    amount: float = 0.0
    creation_date: date
    expiration_date: Optional[date] = None
    status: Optional[str] = "draft"

class EstimateCreate(EstimateBase):
    pass

class EstimateUpdate(BaseModel):
    estimate_number: Optional[str] = None
    amount: Optional[float] = None
    creation_date: Optional[date] = None
    expiration_date: Optional[date] = None
    status: Optional[str] = None

class EstimateOut(EstimateBase):
    id: int
    client_name: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True
