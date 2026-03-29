import uuid
from datetime import date, datetime, timezone
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

# --- 1. User Table ---
class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    full_name: Optional[str] = None
    role: str = Field(default="user")
    is_active: bool = Field(default=True)
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    cases: List["Case"] = Relationship(back_populates="user")
    audit_logs: List["AuditLog"] = Relationship(back_populates="user")


# --- 2. Case Table ---
class Case(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    title: str = Field(nullable=False)
    status: str = Field(default="active")

    # Relationships
    user: User = Relationship(back_populates="cases")
    people: List["Person"] = Relationship(back_populates="case")


# --- 3. Person Table ---
class Person(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    case_id: int = Field(foreign_key="case.id", index=True)
    
    # Self-referencing Foreign Keys for the Tree
    father_id: Optional[int] = Field(default=None, foreign_key="person.id")
    mother_id: Optional[int] = Field(default=None, foreign_key="person.id")
    spouse_id: Optional[int] = Field(default=None, foreign_key="person.id")

    full_name: str = Field(nullable=False)
    gender: str = Field(max_length=1)  # 'M' or 'F'
    birth_date: Optional[date] = None
    birth_city: Optional[str] = None
    is_alive: bool = Field(default=False)
    role: str = Field(default="ancestor") # progenitor, ancestor, applicant

    # Relationships
    case: Case = Relationship(back_populates="people")
    documents: List["Document"] = Relationship(back_populates="person")
    
    # Self-referencing Relationships (Enables person.father, person.mother, etc.)
    father: Optional["Person"] = Relationship(
        sa_relationship_kwargs={"remote_side": "Person.id", "foreign_keys": "[Person.father_id]"}
    )
    mother: Optional["Person"] = Relationship(
        sa_relationship_kwargs={"remote_side": "Person.id", "foreign_keys": "[Person.mother_id]"}
    )
    spouse: Optional["Person"] = Relationship(
        sa_relationship_kwargs={"remote_side": "Person.id", "foreign_keys": "[Person.spouse_id]"}
    )


# --- 4. Document Table ---
class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    person_id: int = Field(foreign_key="person.id", index=True)
    
    type: str  # 'birth', 'marriage', 'death', 'cnn'
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    person: Person = Relationship(back_populates="documents")
    logs: List["DocumentLog"] = Relationship(back_populates="document")


# --- 5. Document Log Table ---
class DocumentLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id", index=True)
    
    status: str # 'awaiting_emission', 'correction_needed', etc.
    notes: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    document: Document = Relationship(back_populates="logs")


# --- 6. Security & Token Blocklist ---
class TokenBlocklist(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    jti: str = Field(index=True, unique=True, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# --- 7. User Action Logging Table ---
class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id", index=True)
    action: str        
    method: str        
    path: str          
    ip_address: str
    status_code: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship
    user: Optional[User] = Relationship(back_populates="audit_logs")