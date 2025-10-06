from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
import os

# Database connection
DATABASE_URL = "mysql+pymysql://root:Farhan113@localhost/nextnrgie?charset=utf8mb4"
engine = create_engine(DATABASE_URL)
metadata = MetaData()

# Reflect all tables
metadata.reflect(bind=engine)

# Drop all tables
print("Dropping all tables...")
metadata.drop_all(engine)

# Now import models to create tables
print("Creating tables...")
from app.core.database import Base
Base.metadata.create_all(bind=engine)

print("Database tables recreated successfully!")
