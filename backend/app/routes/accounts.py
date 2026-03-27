from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def read_accounts():
    return {"message": "Caddy -> FastAPI (inside app folder) this!"}