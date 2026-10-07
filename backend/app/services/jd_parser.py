"""
jd_parser.py

Handles job description ingestion: either pasted raw text, or a PDF/DOCX
upload. Reuses the resume_parser extraction primitives since the
underlying file formats are identical.
"""
from __future__ import annotations

from typing import Tuple

from app.services.resume_parser import extract_text, EmptyDocumentError


def parse_job_description_text(raw_text: str) -> str:
    cleaned = (raw_text or "").strip()
    if len(cleaned) < 20:
        raise EmptyDocumentError(
            "Job description text is too short to analyze meaningfully."
        )
    return cleaned


def parse_job_description_file(filename: str, file_bytes: bytes) -> Tuple[str, str]:
    return extract_text(filename, file_bytes)
