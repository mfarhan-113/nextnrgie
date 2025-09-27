from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    client_number = Column(String, unique=True, index=True, nullable=False)
    client_name = Column(String, nullable=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    tva_number = Column(String, nullable=True)
    tsa_number = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)
    contact_person_phone = Column(String, nullable=True)
    contact_person_designation = Column(String, nullable=True)
    client_address = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner = relationship("User", back_populates="clients")
