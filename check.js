import os
print("Using DB file:", os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db"))