# Import all models here so they're registered with SQLAlchemy
from .base import Base, BaseModel
from .user import User
from .client import Client
from .contract import Contract
from .contract_detail import ContractDetail
from .facture import Facture
from .salary import Salary
from .invoice import Invoice
from .misc import Misc  # Changed from Miscellaneous to Misc
from .estimate import Estimate

# This makes the models available when importing from app.models
__all__ = [
    'Base',
    'BaseModel',
    'User',
    'Client',
    'Contract',
    'ContractDetail',
    'Facture',
    'Salary',
    'Invoice',
    'Misc',  # Changed from 'Miscellaneous' to 'Misc'
    'Estimate'
]
