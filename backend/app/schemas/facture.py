# from pydantic import BaseModel, Field
# from datetime import datetime
# from typing import Optional

# class FactureBase(BaseModel):
#     contract_id: int
#     description: str
#     qty: float = Field(..., gt=0)
#     unit_price: float = Field(..., gt=0)
#     tva: float = Field(..., ge=0, le=100)
#     total_ht: float = Field(..., gt=0)

# class FactureCreate(FactureBase):
#     pass

# class FactureUpdate(BaseModel):
#     description: Optional[str] = None
#     qty: Optional[float] = Field(None, gt=0)
#     unit_price: Optional[float] = Field(None, gt=0)
#     tva: Optional[float] = Field(None, ge=0, le=100)
#     total_ht: Optional[float] = Field(None, gt=0)

# class FactureInDBBase(FactureBase):
#     id: int
#     created_at: datetime

#     class Config:
#         orm_mode = True

# class Facture(FactureInDBBase):
#     pass


# In backend/app/schemas/facture.py
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List

class FactureBase(BaseModel):
    """Base schema for Facture with common fields and validations."""
    contract_id: int = Field(..., description="ID of the contract this facture belongs to")
    description: str = Field(..., max_length=255, description="Description of the facture item")
    qty: float = Field(..., gt=0, description="Quantity of items")
    unit_price: float = Field(..., ge=0, description="Price per unit")
    tva: float = Field(20.0, ge=0, le=100, description="TVA rate in percentage (0-100)")
    total_ht: float = Field(..., ge=0, description="Total amount excluding TVA")

    @validator('description')
    def description_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()

    @validator('total_ht')
    def validate_total_ht(cls, v, values):
        if 'qty' in values and 'unit_price' in values and 'tva' in values:
            subtotal = values['qty'] * values['unit_price']
            tva_amount = subtotal * (values['tva'] / 100)
            calculated = subtotal + tva_amount
            # Use a more lenient tolerance for floating point comparisons
            if abs(calculated - v) > 1.0:  # Allow up to 1.0 difference
                raise ValueError(f'Total HT must be equal to (qty * unit_price) * (1 + tva/100). Expected: {calculated:.2f}, got: {v:.2f}')
        return v

class FactureCreate(FactureBase):
    """Schema for creating a new facture."""
    pass

class FactureUpdate(BaseModel):
    """Schema for updating an existing facture."""
    description: Optional[str] = Field(None, max_length=255, description="Updated description")
    qty: Optional[float] = Field(None, gt=0, description="Updated quantity")
    unit_price: Optional[float] = Field(None, ge=0, description="Updated unit price")
    tva: Optional[float] = Field(None, ge=0, le=100, description="Updated TVA rate in percentage")
    total_ht: Optional[float] = Field(None, ge=0, description="Updated total amount excluding TVA")

class FactureInDBBase(FactureBase):
    """Base schema for facture in database."""
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class Facture(FactureInDBBase):
    """Schema for returning facture data."""
    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "contract_id": 1,
                "description": "Web Development Services",
                "qty": 10,
                "unit_price": 100.0,
                "tva": 20.0,
                "total_ht": 1000.0,
                "created_at": "2023-01-01T12:00:00"
            }
        }