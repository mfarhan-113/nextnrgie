from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, client, contract, contract_detail, invoice, salary, misc, pdf, dashboard

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(client.router)
app.include_router(contract.router)
app.include_router(contract_detail.router)
app.include_router(invoice.router)
app.include_router(salary.router)
app.include_router(misc.router)
app.include_router(pdf.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
