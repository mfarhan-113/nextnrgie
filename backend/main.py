from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
from app.api.v1.api import api_router
app.include_router(api_router, prefix="/api")  # This adds /api prefix to all routes

@app.get("/")
def read_root():
    return {"message": "Welcome to Nextnergie API"}