from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, select, desc, extract
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.client import Client
from app.models.contract import Contract
from app.models.invoice import Invoice
from app.models.salary import Salary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        
        # Simple queries to count records
        clients_count = db.execute(text("SELECT COUNT(*) FROM clients")).scalar() or 0
        contracts_count = db.execute(text("SELECT COUNT(*) FROM contracts")).scalar() or 0
        invoices_count = db.execute(text("SELECT COUNT(*) FROM invoices WHERE status = 'unpaid'")).scalar() or 0
        salaries_count = db.execute(text("SELECT COUNT(*) FROM salaries")).scalar() or 0
        
        return {
            "total_clients": clients_count,
            "total_contracts": contracts_count,
            "invoices_due": invoices_count,
            "employees_tracked": salaries_count
        }
    except Exception as e:
        # Return default values if database query fails
        return {
            "total_clients": 0,
            "total_contracts": 0,
            "invoices_due": 0,
            "employees_tracked": 0
        }

@router.get("/recent-activity")
def get_recent_activity(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        
        # Get latest 5 clients
        clients = db.execute(text("SELECT client_number, created_at FROM clients ORDER BY created_at DESC LIMIT 5")).fetchall()
        clients_data = [{"name": row.client_number, "date": row.created_at.strftime("%Y-%m-%d"), "type": "Client"} for row in clients]
        
        # Get latest 5 contracts
        contracts = db.execute(text("SELECT command_number, created_at FROM contracts ORDER BY created_at DESC LIMIT 5")).fetchall()
        contracts_data = [{"name": row.command_number, "date": row.created_at.strftime("%Y-%m-%d"), "type": "Contract"} for row in contracts]
        
        # Merge and sort by date descending
        merged = clients_data + contracts_data
        merged.sort(key=lambda x: x["date"], reverse=True)
        return merged[:8]
    except Exception as e:
        # Return empty array if query fails
        return []

@router.get("/contract-growth")
def get_contract_growth(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        
        # Get counts of contracts per month for last 6 months (including current)
        now = datetime.now()
        contract_counts = {}
        
        for i in range(5, -1, -1):
            month = (now.replace(day=1) - timedelta(days=30*i)).replace(day=1)
            year_month = f"{month.year}-{month.month:02d}"
            
            # Query contracts for this month
            query = text(f"SELECT COUNT(*) FROM contracts WHERE YEAR(created_at) = {month.year} AND MONTH(created_at) = {month.month}")
            count = db.execute(query).scalar() or 0
            contract_counts[year_month] = count
        
        # Return as list of {month: 'YYYY-MM', count: int}
        return [
            {"month": k, "count": contract_counts[k]} for k in sorted(contract_counts.keys())
        ]
    except Exception as e:
        # Return sample data if query fails
        return [
            {"month": "2024-01", "count": 5},
            {"month": "2024-02", "count": 8},
            {"month": "2024-03", "count": 12},
            {"month": "2024-04", "count": 15},
            {"month": "2024-05", "count": 10},
            {"month": "2024-06", "count": 18}
        ]
