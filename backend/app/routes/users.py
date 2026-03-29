import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Body
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

# Import Database Tables
from app.models.SQLmodels import User, TokenBlocklist

# Import Security Logic from Core
from app.core.auth import (
    hash_password, 
    verify_password, 
    create_access_token, 
    create_refresh_token, 
    decode_token,
    get_current_user,
    get_admin_user
)
from app.core.database import get_session

# Import Models
from app.models.users import UserRead, UserCreate, UserLogin, UserUpdate

# --- Router Setup ---
router = APIRouter(prefix="/users", tags=["Users"])

# ---------------------------------------------------------
# POST /users/register
# ---------------------------------------------------------
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, session: Session = Depends(get_session)):
    """
    Registers a new user.
    """
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
    """
    Logs the user in.
    """
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Generate BOTH tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Set Access Cookie (15 mins)
    response.set_cookie(
        key="access_token", value=access_token, httponly=True, secure=True, samesite="lax", max_age=900 
    )
    
    # Set Refresh Cookie (7 Days, strictly routed to /refresh to save bandwidth)
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax", max_age=604800, path="/api/users"
    )

    return {"message": "Login successful", "user": {"email": user.email, "name": user.full_name}}

# ---------------------------------------------------------
# POST /users/refresh
# ---------------------------------------------------------
@router.post("/refresh")
def refresh_session(
    response: Response, 
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session)
):
    """Issues a new access token using a valid refresh token cookie."""
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    payload = decode_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    # Check the blocklist to ensure this token wasn't revoked
    jti = payload.get("jti")
    is_blocked = session.exec(select(TokenBlocklist).where(TokenBlocklist.jti == jti)).first()
    if is_blocked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

    user_id_str = payload.get("sub")
    
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID format")
        
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or deleted")

    # Generate a fresh access token
    new_access_token = create_access_token(data={"sub": str(user.id)})

    response.set_cookie(
        key="access_token", value=new_access_token, httponly=True, secure=True, samesite="lax", max_age=900 
    )

    return {"message": "Session refreshed successfully"}

# ---------------------------------------------------------
# GET /users/me
# ---------------------------------------------------------
@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated user's profile."""
    return current_user

# ---------------------------------------------------------
# POST /users/logout
# ---------------------------------------------------------
@router.post("/logout")
def logout(
    response: Response, 
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session)
):
    """
    Logs the user out.
    """

    # Add the refresh token to the blocklist so it can never be used again
    if refresh_token:
        payload = decode_token(refresh_token)
        if payload and payload.get("type") == "refresh":
            jti = payload.get("jti")
            if jti:
                session.add(TokenBlocklist(jti=jti))
                session.commit()

    # Clear the cookies from the browser
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/api/users")
    
    return {"message": "Logged out successfully"}

# ---------------------------------------------------------
# DELETE /users/me
# ---------------------------------------------------------
@router.delete("/me")
def delete_my_account(
    response: Response,
    current_user: User = Depends(get_current_user),
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session)
):
    """
    Soft-deletes the currently authenticated user's account, 
    revokes their tokens, and logs them out.
    """
    # Soft Delete: Mark the user as inactive and keep in db for set amount of time
    current_user.is_active = False
    session.add(current_user)

    if refresh_token:
        payload = decode_token(refresh_token)
        if payload and payload.get("type") == "refresh":
            jti = payload.get("jti")
            if jti:
                session.add(TokenBlocklist(jti=jti))

    session.commit()

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/api/users")
    
    return {"message": "Account successfully deleted and logged out."}

# ---------------------------------------------------------
# PATCH /users/me
# ---------------------------------------------------------
@router.patch("/me", response_model=UserRead)
def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Updates the currently logged-in user's profile.
    Only provided fields will be changed.
    """
    # 1. Extract only the fields the frontend actually sent
    update_data = user_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided to update."
        )

    # 2. Check for Email Collisions
    if "email" in update_data and update_data["email"] != current_user.email:
        existing_user = session.exec(select(User).where(User.email == update_data["email"])).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already in use by another account."
            )

    # 3. Handle Password Hashing
    if "password" in update_data:
        # Hash the new password and replace the plain text one in the dictionary
        update_data["hashed_password"] = hash_password(update_data.pop("password"))

    # 4. Apply the changes dynamically
    for key, value in update_data.items():
        setattr(current_user, key, value)

    # 5. Save to database
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user