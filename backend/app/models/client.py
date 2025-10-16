from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, BaseModel

class Client(Base, BaseModel):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    client_number = Column(String(50), unique=True, index=True)
    client_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    tva_number = Column(String(100))
    tsa_number = Column(String(100))
    contact_person = Column(String(255))
    contact_person_phone = Column(String(50))
    contact_person_designation = Column(String(255))
    client_address = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    owner = relationship("User", back_populates="clients")
    contracts = relationship("Contract", back_populates="client", cascade="all, delete-orphan")
