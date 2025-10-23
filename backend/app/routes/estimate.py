from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.estimate import Estimate
from app.models.client import Client
from app.schemas.estimate import EstimateCreate, EstimateOut, EstimateUpdate

router = APIRouter(prefix="/estimates", tags=["estimates"])

@router.post("/", response_model=EstimateOut)
def create_estimate(payload: EstimateCreate, db: Session = Depends(get_db)):
    # Uniqueness on estimate_number
    if db.query(Estimate).filter(Estimate.estimate_number == payload.estimate_number).first():
        raise HTTPException(status_code=400, detail="Estimate number already exists")

    est = Estimate(
        estimate_number=payload.estimate_number,
        client_id=payload.client_id,
        amount=payload.amount or 0.0,
        creation_date=payload.creation_date,
        expiration_date=payload.expiration_date,
        status=payload.status or "draft",
    )
    db.add(est)
    db.commit()
    db.refresh(est)

    # Attach client name
    client = db.query(Client).filter(Client.id == est.client_id).first()
    out = EstimateOut(
        id=est.id,
        estimate_number=est.estimate_number,
        client_id=est.client_id,
        amount=est.amount or 0.0,
        creation_date=est.creation_date,
        expiration_date=est.expiration_date,
        status=est.status or "draft",
        client_name=(client.client_name if client else None)
    )
    return out

@router.get("/", response_model=List[EstimateOut])
def list_estimates(db: Session = Depends(get_db)):
    rows = db.query(Estimate).all()
    out: List[EstimateOut] = []
    for r in rows:
        client = db.query(Client).filter(Client.id == r.client_id).first()
        out.append(EstimateOut(
            id=r.id,
            estimate_number=r.estimate_number,
            client_id=r.client_id,
            amount=r.amount or 0.0,
            creation_date=r.creation_date,
            expiration_date=r.expiration_date,
            status=r.status or "draft",
            client_name=(client.client_name if client else None),
        ))
    return out

@router.put("/{estimate_id}", response_model=EstimateOut)
def update_estimate(estimate_id: int, payload: EstimateUpdate, db: Session = Depends(get_db)):
    est = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not est:
        raise HTTPException(status_code=404, detail="Estimate not found")

    # Update number with uniqueness
    if payload.estimate_number is not None:
        if not payload.estimate_number.strip():
            raise HTTPException(status_code=422, detail="Invalid estimate_number")
        # Check unique
        exists = db.query(Estimate).filter(
            Estimate.estimate_number == payload.estimate_number,
            Estimate.id != estimate_id
        ).first()
        if exists:
            raise HTTPException(status_code=400, detail="Estimate number already exists")
        est.estimate_number = payload.estimate_number.strip()

    if payload.amount is not None:
        est.amount = float(payload.amount)
    if payload.creation_date is not None:
        est.creation_date = payload.creation_date
    if payload.expiration_date is not None:
        est.expiration_date = payload.expiration_date
    if payload.status is not None:
        est.status = payload.status

    db.add(est)
    db.commit()
    db.refresh(est)

    client = db.query(Client).filter(Client.id == est.client_id).first()
    return EstimateOut(
        id=est.id,
        estimate_number=est.estimate_number,
        client_id=est.client_id,
        amount=est.amount or 0.0,
        creation_date=est.creation_date,
        expiration_date=est.expiration_date,
        status=est.status or "draft",
        client_name=(client.client_name if client else None)
    )

@router.delete("/{estimate_id}", status_code=204)
def delete_estimate(estimate_id: int, db: Session = Depends(get_db)):
    est = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not est:
        raise HTTPException(status_code=404, detail="Estimate not found")
    db.delete(est)
    db.commit()
    return None
