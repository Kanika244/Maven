from datetime import datetime, timedelta, timezone
import hashlib
import logging
import os

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from databases.postgres import get_db
from models import (
    User,
    OTP,
    InvestorProfile,
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    EmailRequest,
    PasswordSetup,
    OTPVerify,
    ProfileUpdate,
)
from utils.email_templates import get_reset_password_email, get_otp_email
from utils.email_utils import generate_otp, send_email_smtplib

load_dotenv()

logger = logging.getLogger(__name__)

authrouter = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is not set in the environment")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")


def hash_password(password: str) -> str:
    sha = hashlib.sha256(password.encode("utf-8")).digest()
    return pwd_context.hash(sha)


def verify_password(password: str, hashed_password: str) -> bool:
    sha = hashlib.sha256(password.encode("utf-8")).digest()
    return pwd_context.verify(sha, hashed_password)


def create_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Identifies which logged-in user a bearer token belongs to.

    Used by /profile below, and imported by kyc.py for the same purpose —
    keep this as the single place that decodes the JWT and loads the user.
    """
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.PyJWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


@authrouter.post("/register/")
async def register_user(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    existing = result.scalar_one_or_none()
    if existing and existing.status == "active":
        raise HTTPException(status_code=400, detail="Already Registered")

    hashed_pass = hash_password(data.password)

    if existing:
        existing.name = data.name
        existing.password = hashed_pass
        existing.status = "pending_verification"
    else:
        db.add(User(name=data.name, email=data.email, password=hashed_pass, status="pending_verification"))

    otp = generate_otp()
    await db.execute(delete(OTP).where(OTP.email == data.email, OTP.type == "register"))
    db.add(OTP(
        email=data.email,
        otp=otp,
        type="register",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
    ))

    await db.commit()

    try:
        send_email_smtplib(
            sender_email=os.getenv("MY_EMAIL"),
            recipient_email=data.email,
            subject="Your OTP for MAVEN Registration",
            body=get_otp_email(otp, purpose="MAVEN Registration"),
            smtp_server=os.getenv("SMTP_SERVER"),
            smtp_port=int(os.getenv("SMTP_PORT", 587)),
            username=os.getenv("MY_EMAIL"),
            password=os.getenv("MY_PASS"),
        )
    except Exception:
        logger.exception("Failed to send registration OTP email to %s", data.email)
        raise HTTPException(status_code=502, detail="Could not send verification email. Please try again.")

    return {"message": "User Registered Successfully. OTP sent to email for verification."}


@authrouter.post("/verify")
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(OTP).where(OTP.email == data.email, OTP.type == "register")
    )
    otp_record = result.scalar_one_or_none()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if otp_record.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if otp_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP has expired")

    await db.execute(delete(OTP).where(OTP.id == otp_record.id))
    await db.execute(update(User).where(User.email == data.email).values(status="active"))
    await db.commit()

    return {"message": "OTP verified successfully", "email": data.email}


@authrouter.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalar_one_or_none()

    if not user or not user.password:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if user.status != "active":
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")

    access_token = create_token(
        data={"sub": user.email, "type": "investor", "id": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "name": user.name or "",
        "status": "completed",
    }


@authrouter.post("/setup-password")
async def setup_password(data: PasswordSetup, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please start with email step.")

    user.password = hash_password(data.password)
    user.status = "active"
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return {"message": "Password setup complete successfully"}


@authrouter.post("/send_email_otp")
async def send_email_otp(data: EmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    existing = result.scalar_one_or_none()
    if existing and existing.status == "active":
        raise HTTPException(status_code=400, detail="User already exists")

    if not existing:
        db.add(User(email=data.email, status="pending_registration"))

    otp = generate_otp()
    await db.execute(delete(OTP).where(OTP.email == data.email, OTP.type == "register"))
    db.add(OTP(
        email=data.email,
        otp=otp,
        type="register",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
    ))
    await db.commit()

    try:
        send_email_smtplib(
            sender_email=os.getenv("MY_EMAIL"),
            recipient_email=data.email,
            subject="Your OTP for MAVEN",
            body=get_otp_email(otp, purpose="MAVEN Password Setup"),
            smtp_server=os.getenv("SMTP_SERVER"),
            smtp_port=int(os.getenv("SMTP_PORT", 587)),
            username=os.getenv("MY_EMAIL"),
            password=os.getenv("MY_PASS"),
        )
    except Exception:
        logger.exception("Failed to send OTP email to %s", data.email)
        raise HTTPException(status_code=502, detail="Could not send verification email. Please try again.")

    return {"message": "OTP sent successfully"}


@authrouter.post("/profile")
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create or update the investor_profiles row for the logged-in user.

    This is what was missing before: models.py already defined InvestorProfile
    and ProfileUpdate, but no route ever used them, so nothing was ever written.
    """
    result = await db.execute(
        select(InvestorProfile).where(InvestorProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    updates = data.model_dump(exclude_unset=True)

    # full_name belongs to the users table, not investor_profiles
    if "full_name" in updates:
        current_user.name = updates.pop("full_name")

    if profile:
        for field, value in updates.items():
            setattr(profile, field, value)
    else:
        profile = InvestorProfile(user_id=current_user.id, **updates)
        db.add(profile)

    await db.commit()
    return {"message": "Profile saved successfully"}


@authrouter.post("/forgot-password")
async def forgot_password(data: EmailRequest, db: AsyncSession = Depends(get_db)):
    """Send password reset link to a registered investor email."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user:
        return {"message": "If this email is registered, a reset link has been sent."}

    reset_token = create_token(
        data={"sub": data.email, "type": "password_reset"},
        expires_delta=timedelta(minutes=15),
    )

    await db.execute(delete(OTP).where(OTP.email == data.email, OTP.type == "password_reset"))
    db.add(OTP(
        email=data.email,
        type="password_reset",
        token=reset_token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
    ))
    await db.commit()

    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    try:
        send_email_smtplib(
            sender_email=os.getenv("MY_EMAIL"),
            recipient_email=data.email,
            subject="Reset Your MAVEN Password",
            body=get_reset_password_email(reset_link),
            smtp_server=os.getenv("SMTP_SERVER"),
            smtp_port=int(os.getenv("SMTP_PORT", 587)),
            username=os.getenv("MY_EMAIL"),
            password=os.getenv("MY_PASS"),
        )
    except Exception:
        # Log the real failure, but keep the response generic so we don't
        # leak whether this email is registered.
        logger.exception("Failed to send password reset email to %s", data.email)

    return {"message": "If this email is registered, a reset link has been sent."}


@authrouter.post("/reset-password")
async def reset_password(data: dict, db: AsyncSession = Depends(get_db)):
    """Verify reset token and update password."""
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        email = payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    result = await db.execute(
        select(OTP).where(OTP.email == email, OTP.type == "password_reset", OTP.token == token)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=400, detail="Reset link has already been used or expired.")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    user.password = hash_password(new_password)
    user.updated_at = datetime.now(timezone.utc)
    await db.execute(delete(OTP).where(OTP.id == record.id))
    await db.commit()

    return {"message": "Password reset successfully. You can now log in."}