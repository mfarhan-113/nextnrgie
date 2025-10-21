from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    command_number = Column(String(50), unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=False)
    guarantee_percentage = Column(Float, nullable=True)
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_address = Column(String(500), nullable=True)
    name = Column(String(200), nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="contracts")
    invoices = relationship("Invoice", back_populates="contract", cascade="all, delete-orphan")
    factures = relationship("Facture", back_populates="contract", cascade="all, delete-orphan")
    contract_details = relationship("ContractDetail", back_populates="contract", cascade="all, delete-orphan")