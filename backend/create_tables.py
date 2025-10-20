import os

from sqlalchemy import create_engine, MetaData

from app.core.database import Base
import app.models  # noqa: F401 ensure models are registered


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://nextnrgie:Farhan113@mysql:3306/nextnrgie?charset=utf8mb4",
)

engine = create_engine(DATABASE_URL)
metadata = MetaData()

print("Dropping all tables...")
metadata.reflect(bind=engine)
metadata.drop_all(engine)

print("Creating tables...")
Base.metadata.create_all(bind=engine)

print("Database tables recreated successfully!")
