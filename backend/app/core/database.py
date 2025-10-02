from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Use synchronous pymysql for XAMPP compatibility
DATABASE_URL = settings.SQLALCHEMY_DATABASE_URL  # Keep pymysql for sync

# Create sync engine
engine = create_engine(
    DATABASE_URL,
    echo=True,
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600
)

# Create sync session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
