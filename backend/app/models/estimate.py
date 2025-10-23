from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Estimate(Base):
    __tablename__ = "estimates"

    id = Column(Integer, primary_key=True, index=True)
    estimate_number = Column(String(255), unique=True, nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    amount = Column(Float, default=0.0)
    status = Column(String(50), default="draft")

    # Dates
    creation_date = Column(Date, nullable=False)  # issue date for quote
    expiration_date = Column(Date, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    client = relationship("Client")
    items = relationship("ContractDetail", back_populates="estimate", cascade="all, delete-orphan")
