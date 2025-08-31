from sqlalchemy import create_engine
from app.core.config import settings
from app.models.base import Base
from app.models.user import User
from app.models.client import Client
from app.models.contract import Contract
from app.models.contract_detail import ContractDetail
from app.models.invoice import Invoice
from app.models.misc import Misc
from app.models.salary import Salary

def init_db():
    # Create all tables
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

if __name__ == "__main__":
    init_db()
