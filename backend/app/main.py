from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    auth_router, client_router, contract_router, contract_detail_router,
    dashboard_router, facture_router, invoice_router, misc_router,
    pdf_router, salary_router
)

app = FastAPI()

# List of allowed origins (add your frontend URLs here)
origins = [
    "http://localhost:3000",  # Local development
    "http://82.29.172.241",   # Your production IP
    "https://nextnrgie.fr",   # Your production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]  # Important for file downloads
)

# Include all routers with /api prefix
api_router = APIRouter(prefix="/api")

# Include all routers
api_router.include_router(dashboard_router)
api_router.include_router(client_router)
api_router.include_router(contract_router)
api_router.include_router(contract_detail_router)
api_router.include_router(facture_router)
api_router.include_router(salary_router)
api_router.include_router(auth_router)
api_router.include_router(pdf_router)
api_router.include_router(misc_router)
api_router.include_router(invoice_router)

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
