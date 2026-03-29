from sqlmodel import create_engine, Session, SQLModel
from app.models.SQLmodels import *
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in environment variables!")

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    # This creates the tables based on your SQLModel classes
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session