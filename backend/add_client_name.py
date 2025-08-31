from app.core.config import settings
from app.models.client import Client
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import asyncio

async def add_client_name_column():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URL, echo=True)
    async with engine.connect() as conn:
        # First check if column exists
        result = await conn.execute(text("PRAGMA table_info(clients)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'client_name' not in columns:
            # Add column if it doesn't exist
            await conn.execute(text("ALTER TABLE clients ADD COLUMN client_name VARCHAR"))
            await conn.commit()

if __name__ == "__main__":
    asyncio.run(add_client_name_column())
