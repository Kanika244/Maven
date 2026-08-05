"""Downloads a corporate announcement's attached PDF and extracts text with
PyMuPDF — same library already used for the KYC OCR pipeline (router/kyc.py),
reused here rather than adding a new dependency.

Deliberately NOT doing OCR here: some NSE filings are scanned images with
no text layer, and OCR tuned for ID documents (KYC's use case) isn't the
same problem as OCR for financial statement tables/prose. If extraction
comes back too short to be useful, we treat it as a failure and skip —
better than feeding the LLM a near-empty or garbled excerpt.
"""

import logging

import fitz  # PyMuPDF
import requests

logger = logging.getLogger(__name__)

# NSE announcement `desc` values that indicate an actual results filing,
# as opposed to board meeting notices, cessations, orders won, etc.
# Checked as a substring match, case-insensitive.
FINANCIAL_RESULT_MARKERS = ["financial result"]

MIN_USEFUL_CHARS = 300  # below this, assume scanned/image PDF, not real text
MAX_EXCERPT_CHARS = 6000  # keep prompt size sane — see analysis.py

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}


def is_financial_result(desc: str | None) -> bool:
    if not desc:
        return False
    lowered = desc.lower()
    return any(marker in lowered for marker in FINANCIAL_RESULT_MARKERS)


def extract_filing_text(pdf_url: str) -> str | None:
    """Downloads the PDF and returns up to MAX_EXCERPT_CHARS of extracted
    text, or None if the download failed or the PDF had no usable text
    layer (likely scanned).
    """
    try:
        resp = requests.get(pdf_url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except requests.RequestException:
        logger.exception("Failed to download filing PDF: %s", pdf_url)
        return None

    try:
        doc = fitz.open(stream=resp.content, filetype="pdf")
        text_parts = [page.get_text() for page in doc]
        doc.close()
    except Exception:
        logger.exception("Failed to extract text from filing PDF: %s", pdf_url)
        return None

    full_text = "\n".join(text_parts).strip()
    if len(full_text) < MIN_USEFUL_CHARS:
        logger.info(
            "Filing PDF text too short (%d chars) — likely scanned/image-only, skipping: %s",
            len(full_text), pdf_url,
        )
        return None

    return full_text[:MAX_EXCERPT_CHARS]
