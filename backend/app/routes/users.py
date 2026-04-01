import uuid
from datetime import datetime, timezone
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Response,
    Cookie,
    Body,
    BackgroundTasks,
    Request,
)
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from pydantic import EmailStr

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
    create_account_recovery_token,
)

from app.core.database import get_session
from app.models.users import UserRead, UserCreate, UserLogin, UserUpdate

# Import Logging Utility
from app.core.logging import log_activity

# --- Router Setup ---
router = APIRouter(prefix="/users", tags=["Users"])


# ---------------------------------------------------------
# POST /users/register
# ---------------------------------------------------------
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    background_tasks: BackgroundTasks,
    request: Request,
    user_in: UserCreate,
    session: Session = Depends(get_session),
):
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
    )
    session.add(new_user)

    try:
        session.commit()
        session.refresh(new_user)
        background_tasks.add_task(
            log_activity,
            new_user.id,
            "REGISTER_SUCCESS",
            "POST",
            "/users/register",
            request.client.host,
            201,
        )
        return new_user

    except IntegrityError:
        session.rollback()
        background_tasks.add_task(
            log_activity,
            None,
            "REGISTER_FAILED_DUPLICATE",
            "POST",
            "/users/register",
            request.client.host,
            400,
        )

        existing_user = session.exec(
            select(User).where(User.email == user_in.email)
        ).first()
        if existing_user and not existing_user.is_active:
            raise HTTPException(
                status_code=400,
                detail="This account was previously deactivated. Please use the Recovery page.",
            )
        raise HTTPException(
            status_code=400, detail="A user with this email already exists."
        )


# ---------------------------------------------------------
# POST /users/login
# ---------------------------------------------------------
@router.post("/login", response_model=UserRead)
def login(
    background_tasks: BackgroundTasks,
    request: Request,
    response: Response,
    login_data: UserLogin,
    session: Session = Depends(get_session),
):
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        background_tasks.add_task(
            log_activity,
            None,
            "LOGIN_FAILED_CREDENTIALS",
            "POST",
            "/users/login",
            request.client.host,
            401,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_active:
        background_tasks.add_task(
            log_activity,
            user.id,
            "LOGIN_FAILED_INACTIVE",
            "POST",
            "/users/login",
            request.client.host,
            403,
        )
        raise HTTPException(
            status_code=403, detail="This account has been deactivated."
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=900,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=604800,
        path="/api/users",
    )

    background_tasks.add_task(
        log_activity,
        user.id,
        "LOGIN_SUCCESS",
        "POST",
        "/users/login",
        request.client.host,
        200,
    )
    return user


# ---------------------------------------------------------
# POST /users/refresh
# ---------------------------------------------------------
@router.post("/refresh")
def refresh_session(
    background_tasks: BackgroundTasks,
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = uuid.UUID(payload.get("sub"))
    user = session.exec(select(User).where(User.id == user_id)).first()

    if not user or not user.is_active:
        background_tasks.add_task(
            log_activity,
            user_id,
            "REFRESH_FAILED_INACTIVE",
            "POST",
            "/users/refresh",
            request.client.host,
            401,
        )
        raise HTTPException(
            status_code=401, detail="User account is inactive or deleted"
        )

    new_access_token = create_access_token(data={"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=900,
    )

    background_tasks.add_task(
        log_activity,
        user.id,
        "SESSION_REFRESHED",
        "POST",
        "/users/refresh",
        request.client.host,
        200,
    )
    return {"message": "Session refreshed successfully"}


# ---------------------------------------------------------
# GET /users/me
# ---------------------------------------------------------
@router.get("/me", response_model=UserRead)
def get_me(
    background_tasks: BackgroundTasks,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    background_tasks.add_task(
        log_activity,
        current_user.id,
        "PROFILE_VIEWED",
        "GET",
        "/users/me",
        request.client.host,
        200,
    )
    return current_user


# ---------------------------------------------------------
# POST /users/logout
# ---------------------------------------------------------
@router.post("/logout")
def logout(
    background_tasks: BackgroundTasks,
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
):
    user_id = None
    if refresh_token:
        payload = decode_token(refresh_token)
        if payload:
            user_id = payload.get("sub")
            jti = payload.get("jti")
            if jti:
                session.add(TokenBlocklist(jti=jti))
                session.commit()

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/api/users")

    background_tasks.add_task(
        log_activity,
        user_id,
        "LOGOUT",
        "POST",
        "/users/logout",
        request.client.host,
        200,
    )
    return {"message": "Logged out successfully"}


# ---------------------------------------------------------
# DELETE /users/me
# ---------------------------------------------------------
@router.delete("/me")
def delete_my_account(
    background_tasks: BackgroundTasks,
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
):
    current_user.is_active = False
    session.add(current_user)

    if refresh_token:
        payload = decode_token(refresh_token)
        if payload and payload.get("jti"):
            session.add(TokenBlocklist(jti=payload.get("jti")))

    session.commit()
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/api/users")

    background_tasks.add_task(
        log_activity,
        current_user.id,
        "ACCOUNT_DELETED",
        "DELETE",
        "/users/me",
        request.client.host,
        200,
    )
    return {"message": "Account successfully deleted and logged out."}


# ---------------------------------------------------------
# PATCH /users/me
# ---------------------------------------------------------
@router.patch("/me", response_model=UserRead)
def update_my_profile(
    background_tasks: BackgroundTasks,
    request: Request,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Updates the profile. Requires current_password to prevent hijacking.
    Manually updates updated_at to ensure UTC consistency.
    """
    # 1. Security Verification: Check current password
    if not verify_password(user_update.current_password, current_user.hashed_password):
        # Sync log for failure
        log_activity(
            current_user.id,
            "PROFILE_UPDATE_FAILED_AUTH",
            "PATCH",
            "/users/me",
            request.client.host,
            401,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid current password."
        )

    # 2. Extract data (excluding the verification field)
    update_data = user_update.model_dump(exclude_unset=True)
    update_data.pop("current_password")

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided to update.",
        )

    # 3. Check for Email Collisions
    if "email" in update_data and update_data["email"] != current_user.email:
        existing_user = session.exec(
            select(User).where(User.email == update_data["email"])
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already in use.",
            )

    # 4. Handle Password Hashing
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))

    # 5. Apply Changes & Force Timestamp Update
    for key, value in update_data.items():
        setattr(current_user, key, value)

    # Manually set to UTC now to match the AuditLog timing
    current_user.updated_at = datetime.now(timezone.utc)

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    # 6. Log Success via Background Task
    background_tasks.add_task(
        log_activity,
        current_user.id,
        "PROFILE_UPDATED",
        "PATCH",
        "/users/me",
        request.client.host,
        200,
    )

    return current_user


# ---------------------------------------------------------
# POST /users/forgot-password
# ---------------------------------------------------------
@router.post("/forgot-password")
async def forgot_password(
    background_tasks: BackgroundTasks,
    request: Request,
    email: EmailStr = Body(..., embed=True),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.email == email)).first()

    if user and user.is_active:
        token = create_password_reset_token(user.id)
        background_tasks.add_task(EmailService.send_reset_password_email, email, token)
        background_tasks.add_task(
            log_activity,
            user.id,
            "FORGOT_PASSWORD_REQUESTED",
            "POST",
            "/users/forgot-password",
            request.client.host,
            200,
        )
    else:
        # We log that someone searched for an email that doesn't exist
        background_tasks.add_task(
            log_activity,
            None,
            "FORGOT_PASSWORD_NOT_FOUND",
            "POST",
            "/users/forgot-password",
            request.client.host,
            200,
        )

    return {
        "message": "If this email is registered, a password reset link has been sent."
    }


# ---------------------------------------------------------
# POST /users/reset-password
# ---------------------------------------------------------
@router.post("/reset-password")
def reset_password(
    background_tasks: BackgroundTasks,
    request: Request,
    token: str,
    new_password: str = Body(..., embed=True),
    session: Session = Depends(get_session),
):
    payload = decode_token(token)
    if not payload or payload.get("type") != "password_reset":
        background_tasks.add_task(
            log_activity,
            None,
            "RESET_PASSWORD_FAILED_TOKEN",
            "POST",
            "/users/reset-password",
            request.client.host,
            400,
        )
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user_id = payload.get("sub")
    user = session.exec(select(User).where(User.id == user_id)).first()

    user.hashed_password = hash_password(new_password)
    user.updated_at = datetime.now(timezone.utc)

    session.add(user)
    session.add(TokenBlocklist(jti=payload.get("jti")))
    session.commit()

    background_tasks.add_task(
        log_activity,
        user.id,
        "PASSWORD_RESET_SUCCESS",
        "POST",
        "/users/reset-password",
        request.client.host,
        200,
    )
    return {"message": "Password updated successfully."}


# ---------------------------------------------------------
# POST /users/recover-request
# ---------------------------------------------------------
@router.post("/recover-request")
async def request_account_recovery(
    background_tasks: BackgroundTasks,
    request: Request,
    email: EmailStr = Body(..., embed=True),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.email == email)).first()

    if user and not user.is_active:
        token = create_account_recovery_token(user.id)
        background_tasks.add_task(
            EmailService.send_account_recovery_email, email, token
        )
        background_tasks.add_task(
            log_activity,
            user.id,
            "RECOVERY_REQUESTED",
            "POST",
            "/users/recover-request",
            request.client.host,
            200,
        )
    else:
        background_tasks.add_task(
            log_activity,
            None,
            "RECOVERY_REQUESTED_NOT_FOUND",
            "POST",
            "/users/recover-request",
            request.client.host,
            200,
        )

    return {
        "message": "If an inactive account exists, recovery instructions have been sent."
    }


# ---------------------------------------------------------
# POST /users/recover-confirm
# ---------------------------------------------------------
@router.post("/recover-confirm")
def confirm_account_recovery(
    background_tasks: BackgroundTasks,
    request: Request,
    token: str,
    session: Session = Depends(get_session),
):
    payload = decode_token(token)
    if not payload or payload.get("type") != "account_recovery":
        raise HTTPException(status_code=400, detail="Invalid recovery token.")

    user_id = payload.get("sub")
    user = session.exec(select(User).where(User.id == user_id)).first()

    user.is_active = True
    user.updated_at = datetime.now(timezone.utc)
    session.add(user)
    session.add(TokenBlocklist(jti=payload.get("jti")))
    session.commit()

    background_tasks.add_task(
        log_activity,
        user.id,
        "ACCOUNT_REACTIVATED",
        "POST",
        "/users/recover-confirm",
        request.client.host,
        200,
    )
    return {"message": "Account successfully reactivated!"}
