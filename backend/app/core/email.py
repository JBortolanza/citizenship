import os
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
from dotenv import load_dotenv

load_dotenv()

# 1. Configuration: These should be in your .env file
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# This is the base URL of your frontend (e.g., http://localhost)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost")

class EmailService:
    @staticmethod
    async def send_reset_password_email(email: EmailStr, token: str):
        """Sends an email with a link to the frontend password reset page."""
        url = f"{FRONTEND_URL}/reset-password?token={token}"
        
        body = f"""
        <html>
            <body>
                <p>You requested a password reset for your Citizenship System account.</p>
                <p>Click the link below to set a new password. This link expires in 15 minutes.</p>
                <a href="{url}">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            </body>
        </html>
        """
        
        message = MessageSchema(
            subject="Citizenship System - Password Reset",
            recipients=[email],
            body=body,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)

    @staticmethod
    async def send_account_recovery_email(email: EmailStr, token: str):
        """Sends an email with a link to the frontend account reactivation page."""
        url = f"{FRONTEND_URL}/recover-account?token={token}"
        
        body = f"""
        <html>
            <body>
                <p>Welcome back! You requested to reactivate your Citizenship System account.</p>
                <p>Click the link below to restore your account access:</p>
                <a href="{url}">Reactivate My Account</a>
                <p>This link is valid for 1 hour.</p>
            </body>
        </html>
        """
        
        message = MessageSchema(
            subject="Citizenship System - Account Recovery",
            recipients=[email],
            body=body,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)