from datetime import datetime
from pydantic import BaseModel

class MiscBase(BaseModel):
    description: str
    price: float
    units: int

class MiscCreate(MiscBase):
    pass

class MiscOut(MiscBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
