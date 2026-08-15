"""
Everything needed for PAN/Aadhaar OCR upload, in one file.

Setup:
  1. Save this as kyc.py in your backend root (next to auth.py, models.py,
     dependencies.py — get_current_user now lives in dependencies.py and is
     shared with auth.py).
  2. In main.py add:
       from kyc import kycrouter, KYCDocument
       app.include_router(kycrouter, prefix="/api/kyc", tags=["kyc"])
     (KYCDocument needs to be imported somewhere before Base.metadata.create_all
     runs, so its table actually gets created — importing it in main.py is enough.)
  3. Install: pip install opencv-python pytesseract PyMuPDF python-multipart
  4. Install the Tesseract binary itself (not just the pip package):
       Linux:  sudo apt install tesseract-ocr
       Mac:    brew install tesseract
       Windows: install it, then uncomment + set the path below.

Frontend calls this as: POST /api/kyc/upload
  - multipart form fields: doc_type ("aadhaar" | "pan"), file
  - header: Authorization: Bearer <token>
  - returns: { doc_type, extracted_id_number, extracted_name, status }
"""

import os
import re
import uuid
from datetime import datetime
from typing import Optional

import cv2
import fitz  # PyMuPDF
import numpy as np
import pytesseract
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column
from databases.postgres import Base, get_db
from models import User
from router.auth import get_current_user
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def _configure_tesseract() -> None:
    """Prefer an explicit env var, then common Windows install locations."""
    if getattr(pytesseract.pytesseract, "tesseract_cmd", None):
        return

    env_path = os.getenv("TESSERACT_CMD")
    if env_path:
        pytesseract.pytesseract.tesseract_cmd = env_path
        return

    candidates = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            pytesseract.pytesseract.tesseract_cmd = candidate
            return


_configure_tesseract()


# ============================================================
# 1. DB table — stores what OCR extracted, per uploaded document
# ============================================================

class KYCDocument(Base):
    __tablename__ = "kyc_documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    doc_type: Mapped[str] = mapped_column(String, nullable=False)  # "aadhaar" | "pan"
    extracted_id_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    extracted_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending_review")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class KYCUploadResponse(BaseModel):
    doc_type: str
    extracted_id_number: Optional[str]
    extracted_name: Optional[str]
    status: str


# ============================================================
# 2. OCR — read text out of the uploaded image/PDF
# ============================================================

def _preprocess_image(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    return gray


def _extract_text_sync(file_content: bytes, is_pdf: bool) -> str:
    if is_pdf:
        doc = fitz.open(stream=file_content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    else:
        processed_img = _preprocess_image(file_content)
        return pytesseract.image_to_string(processed_img, lang="eng")


async def extract_text_async(file_content: bytes, is_pdf: bool) -> str:
    if not is_pdf and not pytesseract.pytesseract.tesseract_cmd:
        raise RuntimeError(
            "Tesseract OCR is not installed or not configured. Set TESSERACT_CMD to the tesseract.exe path."
        )
    return await run_in_threadpool(_extract_text_sync, file_content, is_pdf)


# ============================================================
# 3. Parsing — pull the ID number + name out of the raw OCR text
# ============================================================

NAME_BLOCKLIST = [
    "GOVERNMENT", "INDIA", "INCOME", "TAX", "DOB", "YEAR",
    "MALE", "FEMALE", "AADHAAR", "PERMANENT", "ACCOUNT", "NUMBER",
    "CARD", "DEPARTMENT",
]


def _normalize_ocr_text(text: str) -> str:
    """Collapse OCR noise so ID patterns are easier to detect."""
    return re.sub(r"[^A-Z0-9\s]", " ", text.upper())


def _extract_name(text: str) -> Optional[str]:
    for line in text.split("\n"):
        clean = line.strip()
        if (
            clean.isupper()
            and len(clean.split()) > 1
            and not any(x in clean for x in NAME_BLOCKLIST)
            and not re.search(r"\d", clean)
        ):
            return clean
    return None


def parse_document(text: str, doc_type: str):
    if doc_type == "aadhaar":
        match = re.search(r"\b\d{4}\s?\d{4}\s?\d{4}\b", text)
        extracted_id = match.group().replace(" ", "").replace("\n", "") if match else None
        return extracted_id, _extract_name(text)

    if doc_type == "pan":
        normalized = _normalize_ocr_text(text)
        match = re.search(r"\b[A-Z]{5}\s*[0-9O]{4}\s*[A-Z]\b", normalized)
        extracted_id = None
        if match:
            extracted_id = re.sub(r"\s+", "", match.group()).replace("O", "0")
        else:
            compact = re.sub(r"[^A-Z0-9]", "", normalized).replace("O", "0")
            for i in range(len(compact) - 9):
                candidate = compact[i : i + 10]
                if re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", candidate):
                    extracted_id = candidate
                    break
        return extracted_id, _extract_name(text)

    raise ValueError(f"Unsupported doc_type: {doc_type}")


# ============================================================
# 4. The actual endpoint
#    (auth dependency now lives in dependencies.py, shared with auth.py)
# ============================================================

kycrouter = APIRouter()

ALLOWED_DOC_TYPES = {"aadhaar", "pan"}
MAX_FILE_SIZE_MB = 10


@kycrouter.post("/upload", response_model=KYCUploadResponse)
async def upload_kyc_document(
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc_type = doc_type.lower()
    if doc_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=400, detail="doc_type must be 'aadhaar' or 'pan'")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large (max {MAX_FILE_SIZE_MB}MB)")

    is_pdf = (file.content_type == "application/pdf") or file.filename.lower().endswith(".pdf")
    if not is_pdf and file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(status_code=400, detail="File must be a JPEG/PNG image or a PDF")

    try:
        text = await extract_text_async(content, is_pdf)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=422, detail="Could not read the document — try a clearer scan/photo")

    extracted_id, extracted_name = parse_document(text, doc_type)

    if not extracted_id:
        raise HTTPException(
            status_code=422,
            detail=f"Could not detect a valid {doc_type.upper()} number in the document. Please retake and re-upload.",
        )

    record = KYCDocument(
        user_id=current_user.id,
        doc_type=doc_type,
        extracted_id_number=extracted_id,
        extracted_name=extracted_name,
        status="pending_review",
    )
    db.add(record)
    await db.commit()

    return KYCUploadResponse(
        doc_type=doc_type,
        extracted_id_number=extracted_id,
        extracted_name=extracted_name,
        status="pending_review",
    )
