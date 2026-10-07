"""
report.py

Endpoint:
  GET /api/report/{analysis_id}

Streams back a professionally formatted PDF report for a previously
computed analysis.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

from app.services.pdf_generator import generate_pdf_report
from app.utils.store import analysis_store

router = APIRouter(tags=["report"])


@router.get("/report/{analysis_id}")
async def get_report(analysis_id: str):
    record = analysis_store.get(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found. Run /analyze first.")

    result = record["result"]
    resume_filename = record.get("resume_filename", "resume")

    pdf_bytes = generate_pdf_report(result, resume_filename=resume_filename)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="resume-analysis-{analysis_id[:8]}.pdf"'
        },
    )
