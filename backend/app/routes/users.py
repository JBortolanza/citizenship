from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

# Import Database Table
from app.models.SQLmodels import User

# Import Security Logic from Core
from app.core.auth import hash_password, verify_password, create_access_token
from app.core.database import get_session

# Import of the models used in the routes
from app.models.users import UserRead, UserCreate, UserLogin

# --- Router Setup ---
router = APIRouter(prefix="/users", tags=["Users"])

# ---------------------------------------------------------
# POST /users/register
# ---------------------------------------------------------
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, session: Session = Depends(get_session)):
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password)
    )
    session.add(new_user)
    
    try:
        session.commit()
        session.refresh(new_user)
        return new_user
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

# ---------------------------------------------------------
# POST /users/login
# ---------------------------------------------------------
@router.post("/login")
def login(
    response: Response, 
    login_data: UserLogin, 
    session: Session = Depends(get_session)
):
    # 1. Find the user by email
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement).first()

    # 2. Verify existence and password
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # 3. Create the JWT Token
    token = create_access_token(data={"sub": user.email})

    # 4. Set the HTTP-Only Cookie
    # This keeps the token safe from JavaScript (XSS protection)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=3600,    # 1 hour
        samesite="lax",  # Adjust to 'none' if frontend is on a different domain
        secure=True     # Set to True once you have SSL/HTTPS
    )

    return {"message": "Login successful", "user": {"email": user.email, "name": user.full_name}}

# ---------------------------------------------------------
# POST /users/logout
# ---------------------------------------------------------
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}