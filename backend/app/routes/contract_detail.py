from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.contract_detail import ContractDetailCreate, ContractDetailOut
from app.models.contract_detail import ContractDetail
from app.models.contract import Contract
from sqlalchemy.future import select
from typing import List

router = APIRouter(prefix="/contract-details", tags=["contract-details"])

@router.post("/", response_model=ContractDetailOut)
async def add_contract_detail(detail: ContractDetailCreate, db: AsyncSession = Depends(get_db)):
    # Verify contract exists
    result = await db.execute(select(Contract).where(Contract.id == detail.contract_id))
    contract = result.scalars().first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Create contract detail
    db_detail = ContractDetail(**detail.dict())
    db.add(db_detail)
    await db.commit()
    await db.refresh(db_detail)
    
    return db_detail

@router.get("/contracts/{contract_id}", response_model=List[ContractDetailOut])
async def get_contract_details(contract_id: int, db: AsyncSession = Depends(get_db)):
    # Verify contract exists
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalars().first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Get contract details
    result = await db.execute(select(ContractDetail).where(ContractDetail.contract_id == contract_id))
    return result.scalars().all()

@router.delete("/{detail_id}")
async def delete_contract_detail(detail_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ContractDetail).where(ContractDetail.id == detail_id))
    db_detail = result.scalars().first()
    if not db_detail:
        raise HTTPException(status_code=404, detail="Contract detail not found")
    await db.delete(db_detail)
    await db.commit()
    return {"detail": "Contract detail deleted successfully"}
