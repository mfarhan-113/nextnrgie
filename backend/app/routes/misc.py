from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.misc import MiscCreate, MiscOut
from app.models.misc import Misc
from sqlalchemy.future import select
from typing import List

router = APIRouter(prefix="/misc", tags=["misc"])

@router.post("/", response_model=MiscOut)
async def add_misc(misc: MiscCreate, db: AsyncSession = Depends(get_db)):
    db_misc = Misc(**misc.dict())
    db.add(db_misc)
    await db.commit()
    await db.refresh(db_misc)
    return db_misc

@router.get("/", response_model=List[MiscOut])
async def get_misc(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Misc).order_by(Misc.created_at.desc()))
    return result.scalars().all()

@router.get("/{misc_id}", response_model=MiscOut)
async def get_misc_by_id(misc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Misc).filter(Misc.id == misc_id))
    misc = result.scalars().first()
    if not misc:
        raise HTTPException(status_code=404, detail="Expense not found")
    return misc

@router.put("/{misc_id}", response_model=MiscOut)
async def update_misc(misc_id: int, misc_update: MiscCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Misc).filter(Misc.id == misc_id))
    db_misc = result.scalars().first()
    if not db_misc:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for key, value in misc_update.dict().items():
        setattr(db_misc, key, value)
    
    db.add(db_misc)
    await db.commit()
    await db.refresh(db_misc)
    return db_misc

@router.delete("/{misc_id}")
async def delete_misc(misc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Misc).filter(Misc.id == misc_id))
    db_misc = result.scalars().first()
    if not db_misc:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    await db.delete(db_misc)
    await db.commit()
    return {"status": "success", "message": "Expense deleted successfully"}
