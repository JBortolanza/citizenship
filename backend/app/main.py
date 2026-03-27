from fastapi import FastAPI
from app.routes import accounts

app = FastAPI()

# Caddy sends /api/accounts/* here
app.include_router(accounts.router, prefix="/accounts", tags=["Accounts"])

@app.get("/health")
def health():
    return {"status": "backend is alive"}