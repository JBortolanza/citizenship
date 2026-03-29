from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.routes import users  # Import your route modules

# 1. Life-cycle Management (The modern way to handle startup/shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs when the Docker container starts
    print("Connecting to PostgreSQL and creating tables...")
    init_db()
    yield
    # This runs when the Docker container stops
    print("Shutting down...")

# App Initialization
app = FastAPI(
    title="Citizenship System API",
    description="Backend for documentation management and recognition.",
    version="1.0.0",
    root_path="/api",   
    lifespan=lifespan
)

# Routers
app.include_router(users.router)

# Global Health Check
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "online", "environment": "production-ready"}
