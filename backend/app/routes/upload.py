"""
upload.py

Endpoints:
  POST /api/upload-resume
  POST /api/upload-job-description
"""
from __future__ import annotations

from fastapi import APIRouter, File, UploadFile, HTTPException, Form

from app.models.schemas import UploadResponse
from app.services.resume_parser import (
    extract_text, UnsupportedFileTypeError, EmptyDocumentError,
)
from app.services.jd_parser import parse_job_description_text
from app.utils.store import file_store

router = APIRouter(tags=["upload"])

MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB


async def _read_and_validate(upload: UploadFile) -> bytes:
    content = await upload.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds the 8MB size limit.")
    return content


@router.post("/upload-resume", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    content = await _read_and_validate(file)

    try:
        text, file_type = extract_text(file.filename, content)
    except UnsupportedFileTypeError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except EmptyDocumentError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    file_id = file_store.put({"filename": file.filename, "text": text, "kind": "resume"})

    return UploadResponse(
        file_id=file_id,
        filename=file.filename,
        file_type=file_type,
        characters_extracted=len(text),
        preview=text[:300],
    )


@router.post("/upload-job-description", response_model=UploadResponse)
async def upload_job_description(
    file: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
):
    if file is None and not text:
        raise HTTPException(
            status_code=400,
            detail="Provide either a job description file or pasted text.",
        )

    if file is not None:
        content = await _read_and_validate(file)
        try:
            extracted_text, file_type = extract_text(file.filename, content)
        except UnsupportedFileTypeError as exc:
            raise HTTPException(status_code=415, detail=str(exc)) from exc
        except EmptyDocumentError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        filename = file.filename
    else:
        try:
            extracted_text = parse_job_description_text(text)
        except EmptyDocumentError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        file_type = "text"
        filename = "pasted-job-description.txt"

    file_id = file_store.put({"filename": filename, "text": extracted_text, "kind": "jd"})

    return UploadResponse(
        file_id=file_id,
        filename=filename,
        file_type=file_type,
        characters_extracted=len(extracted_text),
        preview=extracted_text[:300],
    )
