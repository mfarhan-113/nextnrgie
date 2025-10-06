from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime, String

Base = declarative_base()

class BaseModel:
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add a default string length for MySQL compatibility
    @classmethod
    def String(cls, length=255, **kwargs):
        from sqlalchemy import String as _String
        return _String(length=length, **kwargs)
