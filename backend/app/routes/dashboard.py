from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import get_db
from app.models.client import Client
from app.models.contract import Contract
from app.models.invoice import Invoice
from app.models.salary import Salary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Total Clients
    total_clients = await db.execute(select(func.count(Client.id)))
    total_clients = total_clients.scalar()
    # Total Contracts
    total_contracts = await db.execute(select(func.count(Contract.id)))
    total_contracts = total_contracts.scalar()
    # Invoices Due (status == 'unpaid')
    invoices_due = await db.execute(select(func.count(Invoice.id)).where(Invoice.status == 'unpaid'))
    invoices_due = invoices_due.scalar()
    # Employees Tracked (count salaries)
    employees_tracked = await db.execute(select(func.count(Salary.id)))
    employees_tracked = employees_tracked.scalar()
    return {
        "total_clients": total_clients,
        "total_contracts": total_contracts,
        "invoices_due": invoices_due,
        "employees_tracked": employees_tracked
    }

from sqlalchemy import desc, extract
from datetime import datetime, timedelta

@router.get("/recent-activity")
async def get_recent_activity(db: AsyncSession = Depends(get_db)):
    # Latest 5 clients
    client_q = await db.execute(
        select(Client.client_number, Client.created_at).order_by(desc(Client.created_at)).limit(5)
    )
    clients = [
        {"name": row.client_number, "date": row.created_at.strftime("%Y-%m-%d"), "type": "Client"}
        for row in client_q.all()
    ]
    # Latest 5 contracts
    contract_q = await db.execute(
        select(Contract.command_number, Contract.created_at).order_by(desc(Contract.created_at)).limit(5)
    )
    contracts = [
        {"name": row.command_number, "date": row.created_at.strftime("%Y-%m-%d"), "type": "Contract"}
        for row in contract_q.all()
    ]
    # Merge and sort by date descending
    merged = clients + contracts
    merged.sort(key=lambda x: x["date"], reverse=True)
    return merged[:8]

@router.get("/contract-growth")
async def get_contract_growth(db: AsyncSession = Depends(get_db)):
    # Get counts of contracts per month for last 6 months (including current)
    now = datetime.now()
    months = []
    for i in range(5, -1, -1):
        month = (now.replace(day=1) - timedelta(days=30*i)).replace(day=1)
        months.append(month)
    # Query contracts grouped by year and month
    contract_counts = {}
    for m in months:
        year = m.year
        month = m.month
        q = await db.execute(
            select(func.count(Contract.id)).where(
                extract('year', Contract.created_at) == year,
                extract('month', Contract.created_at) == month
            )
        )
        contract_counts[f"{year}-{month:02d}"] = q.scalar()
    # Return as list of {month: 'YYYY-MM', count: int}
    return [
        {"month": k, "count": contract_counts[k]} for k in sorted(contract_counts.keys())
    ]
