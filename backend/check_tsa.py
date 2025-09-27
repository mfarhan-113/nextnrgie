import sys
sys.path.append('.')
from sqlalchemy import create_engine, text
from app.core.database import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
with engine.connect() as conn:
    result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'tsa_number';"))
    if result.fetchone():
        print('TSA column exists in database.')
    else:
        print('TSA column does NOT exist in database.')
