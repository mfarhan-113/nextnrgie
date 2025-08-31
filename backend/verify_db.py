from app.core.config import settings
from app.models.client import Client
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import asyncio

async def verify_database():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URL, echo=True)
    async with engine.connect() as conn:
        # Check if clients table exists
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'"))
        table_exists = result.scalar()
        print(f"Clients table exists: {table_exists}")
        
        if table_exists:
            # Check table schema
            result = await conn.execute(text("PRAGMA table_info(clients)"))
            columns = result.fetchall()
            print("\nTable columns:")
            for col in columns:
                print(f"{col[1]}: {col[2]}")
            
            # Count clients
            result = await conn.execute(text("SELECT COUNT(*) FROM clients"))
            count = result.scalar()
            print(f"\nNumber of clients: {count}")
            
            # List all clients
            result = await conn.execute(text("SELECT * FROM clients"))
            clients = result.fetchall()
            print("\nAll clients:")
            for client in clients:
                print(client)

if __name__ == "__main__":
    asyncio.run(verify_database())
