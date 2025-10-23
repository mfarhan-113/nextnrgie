from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    auth_router, client_router, contract_router, contract_detail_router,
    dashboard_router, facture_router, invoice_router, estimate_router, misc_router,
    pdf_router, salary_router
)

app = FastAPI()

# List of allowed origins
origins = [
    # Local development
    "http://localhost:3000",
    "http://localhost:8080",
    
    # Production domains
    "http://82.29.172.241",
    "https://82.29.172.241",
    "http://nextnrgie.fr",
    "https://nextnrgie.fr",
    "http://www.nextnrgie.fr",
    "https://www.nextnrgie.fr",
    
    # For development - allow all origins in development
    "*"  # Be careful with this in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r'https?://(?:.*\.)?nextnrgie\.fr(?:\:\d+)?$',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all headers
    max_age=600  # Cache preflight requests for 10 minutes
)

# Create API router without prefix
api_router = APIRouter()

# Include all routers with their respective paths
# Note: The order matters - more specific routes should come first
routers = [
    dashboard_router,
    client_router,
    contract_router,
    contract_detail_router,
    facture_router,
    salary_router,
    auth_router,
    pdf_router,
    misc_router,
    invoice_router,
    estimate_router
]

# Include all routers with proper prefixing
for router in routers:
    api_router.include_router(router)

# Mount the API router with /api prefix
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Backend is running!"}
