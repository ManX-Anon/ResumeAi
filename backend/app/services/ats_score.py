"""
ats_score.py

Produces an educational, ATS-style resume score out of 100 by evaluating
several weighted categories using rule-based + NLP heuristics:

  - Skills match with the job description       (30 pts)
  - Experience section presence & strength       (20 pts)
  - Projects section presence & strength         (15 pts)
  - Education section presence                   (10 pts)
  - Formatting & structure quality                (10 pts)
  - Certifications                                (5 pts)
  - Section completeness (contact/summary/etc.)   (10 pts)

This is explicitly NOT a simulation of any real commercial ATS — it's a
transparent, explainable heuristic scorer suitable for an educational /
portfolio project. The disclaimer is always surfaced to the end user.
"""
from __future__ import annotations

import re
from typing import List

from app.models.schemas import ATSBreakdownItem, ATSResult
from app.services.skill_extractor import extract_skills


SECTION_KEYWORDS = {
    "experience": [r"\bexperience\b", r"\bwork history\b", r"\bemployment\b"],
    "projects": [r"\bprojects?\b"],
    "education": [r"\beducation\b", r"\bacademic\b", r"\bdegree\b"],
    "certifications": [r"\bcertificat", r"\blicense\b"],
    "summary": [r"\bsummary\b", r"\bobjective\b", r"\bprofile\b"],
    "contact": [r"\bemail\b|@", r"\bphone\b|\+?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}"],
    "skills": [r"\bskills?\b", r"\btechnologies\b|\btech stack\b"],
}

ACTION_VERBS = [
    "built", "developed", "designed", "implemented", "led", "managed",
    "created", "optimized", "improved", "automated", "deployed",
    "architected", "launched", "delivered", "reduced", "increased",
    "engineered", "analyzed", "collaborated", "spearheaded",
]

MEASURABLE_PATTERN = re.compile(r"\b\d+(\.\d+)?\s?(%|percent|x|k|million|hours|users|ms)\b", re.I)


def _has_section(text_lower: str, patterns: List[str]) -> bool:
    return any(re.search(p, text_lower) for p in patterns)


def _score_skills(resume_text: str, jd_text: str) -> ATSBreakdownItem:
    resume_skills = set(extract_skills(resume_text))
    jd_skills = set(extract_skills(jd_text)) if jd_text else set()

    if jd_skills:
        overlap = resume_skills & jd_skills
        ratio = len(overlap) / max(1, len(jd_skills))
        score = round(ratio * 30, 1)
        explanation = (
            f"{len(overlap)}/{len(jd_skills)} job-description skills found "
            f"in the resume ({round(ratio*100)}% coverage)."
        )
    else:
        # No JD provided — score based on breadth of detected skills
        ratio = min(1.0, len(resume_skills) / 12)
        score = round(ratio * 30, 1)
        explanation = f"{len(resume_skills)} recognized technical skills detected in resume."

    return ATSBreakdownItem(category="Skills Match", score=score, max_score=30.0, explanation=explanation)


def _score_experience(text_lower: str) -> ATSBreakdownItem:
    has_section = _has_section(text_lower, SECTION_KEYWORDS["experience"])
    verb_hits = sum(1 for v in ACTION_VERBS if re.search(rf"\b{v}\b", text_lower))
    measurable_hits = len(MEASURABLE_PATTERN.findall(text_lower))

    score = 0.0
    reasons = []
    if has_section:
        score += 8
        reasons.append("Experience section detected")
    else:
        reasons.append("No clear experience section found")

    verb_score = min(7, verb_hits * 1.0)
    score += verb_score
    reasons.append(f"{verb_hits} strong action verbs used")

    measurable_score = min(5, measurable_hits * 1.5)
    score += measurable_score
    reasons.append(f"{measurable_hits} measurable/quantified achievements found")

    return ATSBreakdownItem(
        category="Experience Quality",
        score=round(score, 1),
        max_score=20.0,
        explanation="; ".join(reasons) + ".",
    )


def _score_projects(text_lower: str) -> ATSBreakdownItem:
    has_section = _has_section(text_lower, SECTION_KEYWORDS["projects"])
    has_github = "github" in text_lower or "github.com" in text_lower
    score = (9 if has_section else 0) + (6 if has_github else 0)
    explanation = (
        f"Projects section {'found' if has_section else 'not found'}; "
        f"GitHub link {'present' if has_github else 'missing'}."
    )
    return ATSBreakdownItem(category="Projects", score=round(min(score, 15), 1), max_score=15.0, explanation=explanation)


def _score_education(text_lower: str) -> ATSBreakdownItem:
    has_section = _has_section(text_lower, SECTION_KEYWORDS["education"])
    score = 10.0 if has_section else 2.0
    explanation = "Education section detected." if has_section else "No clear education section found."
    return ATSBreakdownItem(category="Education", score=score, max_score=10.0, explanation=explanation)


def _score_formatting(raw_text: str) -> ATSBreakdownItem:
    length = len(raw_text.split())
    bullet_like = len(re.findall(r"(^|\n)\s*[•\-\*]\s+", raw_text))

    score = 0.0
    reasons = []

    if 250 <= length <= 1100:
        score += 5
        reasons.append("Resume length is within an ideal range")
    elif length < 250:
        score += 2
        reasons.append("Resume may be too short/sparse")
    else:
        score += 3
        reasons.append("Resume may be too long/dense")

    if bullet_like >= 3:
        score += 5
        reasons.append("Good use of bullet points for scannability")
    else:
        reasons.append("Few or no bullet points detected; ATS parsers prefer bulleted content")

    return ATSBreakdownItem(
        category="Formatting",
        score=round(score, 1),
        max_score=10.0,
        explanation="; ".join(reasons) + ".",
    )


def _score_certifications(text_lower: str) -> ATSBreakdownItem:
    has_section = _has_section(text_lower, SECTION_KEYWORDS["certifications"])
    score = 5.0 if has_section else 0.0
    explanation = "Certifications mentioned." if has_section else "No certifications detected."
    return ATSBreakdownItem(category="Certifications", score=score, max_score=5.0, explanation=explanation)


def _score_completeness(text_lower: str) -> ATSBreakdownItem:
    checks = {
        "Contact info": _has_section(text_lower, SECTION_KEYWORDS["contact"]),
        "Summary/Objective": _has_section(text_lower, SECTION_KEYWORDS["summary"]),
        "Skills section": _has_section(text_lower, SECTION_KEYWORDS["skills"]),
        "LinkedIn": "linkedin" in text_lower,
    }
    present = sum(checks.values())
    score = round((present / len(checks)) * 10, 1)
    missing = [k for k, v in checks.items() if not v]
    explanation = (
        "All key sections present." if not missing
        else f"Missing: {', '.join(missing)}."
    )
    return ATSBreakdownItem(category="Section Completeness", score=score, max_score=10.0, explanation=explanation)


def compute_ats_score(resume_text: str, jd_text: str = "") -> ATSResult:
    text_lower = resume_text.lower()

    breakdown = [
        _score_skills(resume_text, jd_text),
        _score_experience(text_lower),
        _score_projects(text_lower),
        _score_education(text_lower),
        _score_formatting(resume_text),
        _score_certifications(text_lower),
        _score_completeness(text_lower),
    ]

    total = round(sum(item.score for item in breakdown), 1)
    total = max(0.0, min(100.0, total))

    return ATSResult(total_score=total, breakdown=breakdown)
