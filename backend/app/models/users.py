import uuid
from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import EmailStr

# --- REGISTRATION SCHEMA (Request Body) ---
# What the user sends to /register. 
# We call it "password" here because the user sends plain text.
class UserCreate(SQLModel):
    email: EmailStr
    full_name: str
    password: str 

# --- LOGIN SCHEMA (Request Body) ---
# What the user sends to /login
class UserLogin(SQLModel):
    email: EmailStr
    password: str

# --- API RESPONSE SCHEMA (Response Body) ---
# What the API sends back. 
# We EXCLUDE the hashed_password for security.
class UserRead(SQLModel):
    id: uuid.UUID  # Updated from int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool