from pydantic import BaseModel

class SalaryBase(BaseModel):
    employee_name: str
    working_days: int
    leaves: int
    salary_per_day: float
    total_salary: float

class SalaryCreate(SalaryBase):
    pass

class SalaryOut(SalaryBase):
    id: int
    class Config:
        orm_mode = True
