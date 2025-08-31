from backend.app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.future import select
from backend.app.models.client import Client
import asyncio

async def test_db():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URL, echo=True)
    async with engine.connect() as conn:
        result = await conn.execute(select(Client))
        clients = result.scalars().all()
        print(f'Number of clients in database: {len(clients)}')
        for client in clients:
            print(f'Client: {client.client_number} - {client.client_name}')

if __name__ == "__main__":
    asyncio.run(test_db())
