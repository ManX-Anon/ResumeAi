"""
main.py

FastAPI application entrypoint for the Resume Screening & ATS-Style
Resume Analyzer backend.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload, analysis, report

app = FastAPI(
    title="Resume Analyzer API",
    description=(
        "AI/ML-powered resume screening API: parses resumes and job "
        "descriptions, extracts skills, computes a TF-IDF/cosine match "
        "score, produces an educational ATS-style score, generates "
        "improvement suggestions, and exports a PDF report."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # relax for local dev; restrict in real deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(report.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "resume-analyzer-api"}


@app.get("/")
async def root():
    return {
        "message": "Resume Analyzer API is running.",
        "docs": "/docs",
    }
