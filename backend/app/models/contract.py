from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    command_number = Column(String, unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=False)
    guarantee_percentage = Column(Float, nullable=True)
    contact_person = Column(String, nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_address = Column(String(500), nullable=True)
    name = Column(String, nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Relationship to client
    client = relationship("Client")