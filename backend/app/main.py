from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import dashboard, client, contract, facture, salary, auth, pdf  # All routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(client.router)
app.include_router(contract.router)
app.include_router(facture.router)
app.include_router(salary.router)
app.include_router(auth.router)
app.include_router(pdf.router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
