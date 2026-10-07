"""
analysis.py

Endpoint:
  POST /api/analyze

Orchestrates: skill extraction -> similarity scoring -> ATS scoring ->
suggestion generation -> chart data assembly -> persists the result so
/api/report/{analysis_id} can regenerate the PDF later.
"""
from __future__ import annotations

from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    AnalyzeRequest, AnalysisResult, SkillCoverage, ChartsData, ChartSeries,
)
from app.services.skill_extractor import extract_skills, skill_frequency
from app.services.similarity import compute_match_score
from app.services.ats_score import compute_ats_score
from app.services.suggestions import generate_suggestions
from app.utils.store import file_store, analysis_store

router = APIRouter(tags=["analysis"])


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(payload: AnalyzeRequest):
    resume_record = file_store.get(payload.resume_file_id)
    if not resume_record:
        raise HTTPException(status_code=404, detail="Resume file not found. Upload it first.")
    resume_text = resume_record["text"]

    jd_text = ""
    if payload.jd_file_id:
        jd_record = file_store.get(payload.jd_file_id)
        if not jd_record:
            raise HTTPException(status_code=404, detail="Job description file not found.")
        jd_text = jd_record["text"]
    elif payload.jd_text:
        jd_text = payload.jd_text

    # --- Skills ---
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text) if jd_text else []

    matched = sorted(set(resume_skills) & set(jd_skills)) if jd_skills else sorted(resume_skills)
    missing = sorted(set(jd_skills) - set(resume_skills)) if jd_skills else []
    coverage_pct = round((len(matched) / len(jd_skills)) * 100, 1) if jd_skills else 100.0 if resume_skills else 0.0

    skills = SkillCoverage(
        matched_skills=matched,
        missing_skills=missing,
        resume_skill_count=len(resume_skills),
        jd_skill_count=len(jd_skills),
        coverage_percent=coverage_pct,
    )

    # --- Match score ---
    match_score = compute_match_score(resume_text, jd_text) if jd_text else 0.0

    # --- ATS score ---
    ats_result = compute_ats_score(resume_text, jd_text)

    # --- Suggestions ---
    suggestion_list = generate_suggestions(resume_text, ats_result, missing)

    # --- Charts ---
    freq = skill_frequency(resume_text)
    top_freq = sorted(freq.items(), key=lambda kv: kv[1], reverse=True)[:10]

    charts = ChartsData(
        skill_match_pie=ChartSeries(
            labels=["Matched Skills", "Missing Skills"],
            values=[float(len(matched)), float(len(missing))],
        ),
        ats_radar=ChartSeries(
            labels=[item.category for item in ats_result.breakdown],
            values=[item.score for item in ats_result.breakdown],
        ),
        skill_distribution_bar=ChartSeries(
            labels=[k for k, _ in top_freq],
            values=[float(v) for _, v in top_freq],
        ),
    )

    analysis_id = str(uuid.uuid4())
    result = AnalysisResult(
        analysis_id=analysis_id,
        resume_match_score=match_score,
        ats_score=ats_result,
        skills=skills,
        suggestions=suggestion_list,
        charts=charts,
        analyzed_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    )

    analysis_store.put({
        "result": result,
        "resume_filename": resume_record.get("filename", "resume"),
    }, key=analysis_id)

    return result


@router.get("/history")
async def get_history():
    history_list = []
    # Collect all analyses from memory store
    for k, v in analysis_store._data.items():
        res = v["result"]
        history_list.append({
            "analysis_id": k,
            "resume_filename": v.get("resume_filename", "resume"),
            "resume_match_score": res.resume_match_score,
            "ats_score": res.ats_score.total_score,
            "analyzed_at": res.analyzed_at,
        })
    # Sort from newest to oldest if possible
    try:
        history_list.sort(key=lambda x: x["analyzed_at"], reverse=True)
    except Exception:
        pass
    return history_list


@router.get("/analysis/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(analysis_id: str):
    record = analysis_store.get(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return record["result"]

