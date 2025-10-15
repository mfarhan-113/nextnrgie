from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routes import dashboard, client, contract, contract_detail, facture, salary, auth, pdf, misc, invoice  # All routes

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

api_router.include_router(dashboard.router)
api_router.include_router(client.router)
api_router.include_router(contract.router)
api_router.include_router(contract_detail.router)
api_router.include_router(facture.router)
api_router.include_router(salary.router)
api_router.include_router(auth.router)
api_router.include_router(pdf.router)
api_router.include_router(misc.router)
api_router.include_router(invoice.router)

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
