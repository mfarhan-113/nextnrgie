from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Facture(Base):
    __tablename__ = "factures"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    description = Column(Text, nullable=False)
    qty = Column(Float, nullable=False)
    qty_unit = Column(String(20), default="unite")
    unit_price = Column(Float, nullable=False)
    tva = Column(Float, nullable=False)
    total_ht = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)

    # Relationships
    contract = relationship("Contract", back_populates="factures")
    invoice = relationship("Invoice", back_populates="factures")