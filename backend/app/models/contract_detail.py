from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class ContractDetail(Base):
    __tablename__ = "contract_details"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    description = Column(String(500), nullable=False)
    qty = Column(Integer, nullable=False)
    qty_unit = Column(String(20), nullable=False, default="unite")
    unit_price = Column(Float, nullable=False)
    tva = Column(Float, nullable=False)
    total_ht = Column(Float, nullable=False)