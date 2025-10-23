from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class ContractDetail(Base):
    __tablename__ = "contract_details"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=True)
    estimate_id = Column(Integer, ForeignKey("estimates.id", ondelete="CASCADE"), nullable=True)
    description = Column(Text)
    qty = Column(Float, default=1)
    qty_unit = Column(String(50), default="unite")
    unit_price = Column(Float, default=0)
    tva = Column(Float, default=0)
    total_ht = Column(Float, default=0)
    
    # Relationships
    contract = relationship("Contract", back_populates="contract_details")
    estimate = relationship("Estimate", back_populates="contract_details")