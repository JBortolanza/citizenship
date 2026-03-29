from typing import Optional
from sqlmodel import SQLModel, Field

# --- REGISTRATION SCHEMA (Request Body) ---
# What the user sends to /register. 
# We call it "password" here because the user sends plain text.
class UserCreate(SQLModel):
    email: str
    full_name: str
    password: str 

# --- LOGIN SCHEMA (Request Body) ---
# What the user sends to /login
class UserLogin(SQLModel):
    email: str
    password: str

# --- API RESPONSE SCHEMA (Response Body) ---
# What the API sends back. 
# We EXCLUDE the hashed_password for security.
class UserRead(SQLModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool