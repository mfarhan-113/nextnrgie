from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.salary import SalaryCreate, SalaryOut
from app.models.salary import Salary
from sqlalchemy import select
from typing import List

router = APIRouter(prefix="/salaries", tags=["salaries"])

@router.post("/", response_model=SalaryOut)
def add_salary(salary: SalaryCreate, db: Session = Depends(get_db)):
    # Calculate total salary before creating the record
    salary_data = salary.dict()
    salary_data['total_salary'] = salary.working_days * salary.salary_per_day

    db_salary = Salary(**salary_data)
    db.add(db_salary)
    db.commit()
    db.refresh(db_salary)
    return db_salary

@router.get("/", response_model=List[SalaryOut])
def get_salaries(db: Session = Depends(get_db)):
    result = db.execute(select(Salary).order_by(Salary.created_at.desc()))
    return result.scalars().all()

@router.get("/{salary_id}", response_model=SalaryOut)
def get_salary(salary_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Salary).where(Salary.id == salary_id))
    salary = result.scalars().first()
    if not salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return salary

@router.put("/{salary_id}", response_model=SalaryOut)
def update_salary(
    salary_id: int,
    salary_update: SalaryCreate,
    db: Session = Depends(get_db)
):
    result = db.execute(select(Salary).where(Salary.id == salary_id))
    db_salary = result.scalars().first()

    if not db_salary:
        raise HTTPException(status_code=404, detail="Salary record not found")

    # Update fields and recalculate total_salary
    for field, value in salary_update.dict().items():
        if field == 'total_salary':
            setattr(db_salary, 'total_salary', salary_update.working_days * salary_update.salary_per_day)
        else:
            setattr(db_salary, field, value)

    db.commit()
    db.refresh(db_salary)
    return db_salary

@router.delete("/{salary_id}")
def delete_salary(salary_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Salary).where(Salary.id == salary_id))
    db_salary = result.scalars().first()

    if not db_salary:
        raise HTTPException(status_code=404, detail="Salary record not found")

    db.delete(db_salary)
    db.commit()
    return {"message": "Salary record deleted successfully"}
