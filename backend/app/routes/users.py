import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Body
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from pydantic import EmailStr
from fastapi import BackgroundTasks

# Import email service
from app.core.email import EmailService


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
    get_admin_user,
    create_password_reset_token,
    create_account_recovery_token
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

        existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
        
        if existing_user and not existing_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account was previously deactivated. Please use the Recovery page."
            )
        
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
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This account has been deactivated."
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

# ---------------------------------------------------------
# POST /users/forgot-password
# ---------------------------------------------------------
@router.post("/forgot-password")
async def forgot_password(
    background_tasks: BackgroundTasks, 
    email: EmailStr = Body(..., embed=True), 
    session: Session = Depends(get_session)  
):
    """
    This endpoint creates a single use token for resetting the password ands sends to the email.
    """
    user = session.exec(select(User).where(User.email == email)).first()
    
    if user and user.is_active:
        token = create_password_reset_token(user.id)
        background_tasks.add_task(EmailService.send_reset_password_email, email, token)


    return {"message": "If this email is registered, a password reset link has been sent."}

# ---------------------------------------------------------
# POST /users/reset-password
# ---------------------------------------------------------
@router.post("/reset-password")
def reset_password(
    token: str, 
    new_password: str = Body(..., embed=True),
    session: Session = Depends(get_session)
):
    """
    Changes the current password for the new one, verifying the users identity with the reset token sent in the url.
    """
    payload = decode_token(token)
    
    # 1. Validate Token Type & Expiry
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    # 2. Check Blocklist (To prevent using the same reset link twice)
    jti = payload.get("jti")
    if session.exec(select(TokenBlocklist).where(TokenBlocklist.jti == jti)).first():
        raise HTTPException(status_code=400, detail="This reset link has already been used.")

    # 3. Find User
    user_id = payload.get("sub")
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found.")

    # 4. Update Password and Block Token
    user.hashed_password = hash_password(new_password)
    session.add(user)
    session.add(TokenBlocklist(jti=jti)) # Burn the token so it can't be reused
    session.commit()

    return {"message": "Password updated successfully. You can now log in."}

# ---------------------------------------------------------
# POST /users/recover-request
# ---------------------------------------------------------
@router.post("/recover-request")
async def request_account_recovery(
    background_tasks: BackgroundTasks,
    email: EmailStr = Body(..., embed=True),
    session: Session = Depends(get_session)
):
    """
    Finds a deactivated account and sends a recovery link 
    to the user's email via a background task.
    """
    user = session.exec(select(User).where(User.email == email)).first()
    
    if user and not user.is_active:
        token = create_account_recovery_token(user.id)
        background_tasks.add_task(EmailService.send_account_recovery_email, email, token)
        
    return {"message": "If an inactive account exists for this email, recovery instructions have been sent."}


# ---------------------------------------------------------
# POST /users/recover-confirm
# ---------------------------------------------------------
@router.post("/recover-confirm")
def confirm_account_recovery(
    token: str, 
    session: Session = Depends(get_session)
):
    """
    Verifies the recovery token and reactivates the account.
    This bypasses the active user check to allow deactivated users access.
    """
    payload = decode_token(token)
    
    # 1. Verify token integrity and type
    if not payload or payload.get("type") != "account_recovery":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid or expired recovery token."
        )

    # 2. Check if the token has already been used (Blocklist)
    jti = payload.get("jti")
    if session.exec(select(TokenBlocklist).where(TokenBlocklist.jti == jti)).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="This recovery link has already been used."
        )

    # 3. Find the user and reactivate the account
    user_id = payload.get("sub")
    user = session.exec(select(User).where(User.id == user_id)).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.is_active:
        return {"message": "Account is already active. You can log in normally."}

    # Reactivate and "burn" the token
    user.is_active = True
    session.add(user)
    session.add(TokenBlocklist(jti=jti))
    session.commit()

    return {"message": "Account successfully reactivated! You can now log in."}