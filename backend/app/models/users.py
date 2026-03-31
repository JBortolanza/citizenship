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


# --- UPDATE SCHEMA (Request Body) ---
class UserUpdate(SQLModel):
    current_password: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(default=None)


# --- LOGIN SCHEMA (Request Body) ---
# What the user sends to /login
class UserLogin(SQLModel):
    email: EmailStr
    password: str


# --- API RESPONSE SCHEMA (Response Body) ---
class UserRead(SQLModel):
    id: uuid.UUID  # Updated from int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
