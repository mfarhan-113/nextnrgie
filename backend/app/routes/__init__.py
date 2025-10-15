from .auth import router as auth_router
from .client import router as client_router
from .contract import router as contract_router
from .contract_detail import router as contract_detail_router
from .dashboard import router as dashboard_router
from .facture import router as facture_router
from .invoice import router as invoice_router
from .misc import router as misc_router
from .pdf import router as pdf_router
from .salary import router as salary_router

# Export all routers
__all__ = [
    'auth_router',
    'client_router',
    'contract_router',
    'contract_detail_router',
    'dashboard_router',
    'facture_router',
    'invoice_router',
    'misc_router',
    'pdf_router',
    'salary_router'
]
