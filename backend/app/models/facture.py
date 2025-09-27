from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from .base import Base

class Facture(Base):
    __tablename__ = 'facture'
    
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey('contracts.id'), nullable=False)
    description = Column(String, nullable=False)
    qty = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    tva = Column(Float, nullable=False)
    total_ht = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
