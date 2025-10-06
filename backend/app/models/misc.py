from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .base import Base

class Misc(Base):
    __tablename__ = "miscellaneous"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    units = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())