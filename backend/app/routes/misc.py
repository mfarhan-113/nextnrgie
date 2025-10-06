from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.misc import MiscCreate, MiscOut
from app.models.misc import Misc
from sqlalchemy import select
from typing import List

router = APIRouter(prefix="/misc", tags=["misc"])

@router.post("/", response_model=MiscOut)
def add_misc(misc: MiscCreate, db: Session = Depends(get_db)):
    db_misc = Misc(**misc.dict())
    db.add(db_misc)
    db.commit()
    db.refresh(db_misc)
    return db_misc

@router.get("/", response_model=List[MiscOut])
def get_misc(db: Session = Depends(get_db)):
    result = db.execute(select(Misc).order_by(Misc.created_at.desc()))
    return result.scalars().all()

@router.get("/{misc_id}", response_model=MiscOut)
def get_misc_by_id(misc_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Misc).where(Misc.id == misc_id))
    misc = result.scalars().first()
    if not misc:
        raise HTTPException(status_code=404, detail="Misc record not found")
    return misc

@router.put("/{misc_id}", response_model=MiscOut)
def update_misc(misc_id: int, misc_update: MiscCreate, db: Session = Depends(get_db)):
    result = db.execute(select(Misc).where(Misc.id == misc_id))
    db_misc = result.scalars().first()
    if not db_misc:
        raise HTTPException(status_code=404, detail="Misc record not found")

    for key, value in misc_update.dict().items():
        setattr(db_misc, key, value)

    db.commit()
    db.refresh(db_misc)
    return db_misc

@router.delete("/{misc_id}")
def delete_misc(misc_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Misc).where(Misc.id == misc_id))
    db_misc = result.scalars().first()
    if not db_misc:
        raise HTTPException(status_code=404, detail="Misc record not found")

    db.delete(db_misc)
    db.commit()
    return {"message": "Misc record deleted successfully"}
