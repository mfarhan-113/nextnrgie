from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from .base import Base

class Salary(Base):
    __tablename__ = "salaries"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String(100), nullable=False)
    working_days = Column(Integer, nullable=False)
    leaves = Column(Integer, nullable=False)
    salary_per_day = Column(Float, nullable=False)
    total_salary = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
