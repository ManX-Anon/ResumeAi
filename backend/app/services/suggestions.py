"""
suggestions.py

Generates dynamic, actionable resume improvement suggestions based on
the ATS breakdown, missing skills, and raw text heuristics. Every
suggestion is derived from the actual analysis — nothing is hardcoded
independent of the resume's content.
"""
from __future__ import annotations

from typing import List

from app.models.schemas import ATSResult, SuggestionItem


def generate_suggestions(
    resume_text: str,
    ats_result: ATSResult,
    missing_skills: List[str],
) -> List[SuggestionItem]:
    text_lower = resume_text.lower()
    suggestions: List[SuggestionItem] = []

    breakdown_by_category = {item.category: item for item in ats_result.breakdown}

    # Skills
    if missing_skills:
        top_missing = ", ".join(missing_skills[:6])
        suggestions.append(SuggestionItem(
            category="Skills",
            severity="high",
            suggestion=(
                f"Consider adding or highlighting these job-relevant skills if "
                f"you have them: {top_missing}."
            ),
        ))

    # Experience
    exp = breakdown_by_category.get("Experience Quality")
    if exp and exp.score < exp.max_score * 0.6:
        suggestions.append(SuggestionItem(
            category="Experience",
            severity="high",
            suggestion=(
                "Strengthen your experience bullet points using strong action "
                "verbs (e.g. 'built', 'optimized', 'led') and add measurable "
                "outcomes, such as percentages, time saved, or user counts."
            ),
        ))

    # Projects
    proj = breakdown_by_category.get("Projects")
    if proj and proj.score < proj.max_score * 0.6:
        suggestions.append(SuggestionItem(
            category="Projects",
            severity="medium",
            suggestion=(
                "Add a dedicated Projects section with 2-3 relevant projects, "
                "including a short description, tech stack used, and a GitHub link."
            ),
        ))

    if "github" not in text_lower:
        suggestions.append(SuggestionItem(
            category="Links",
            severity="medium",
            suggestion="Add a link to your GitHub profile so recruiters can see your code.",
        ))

    if "linkedin" not in text_lower:
        suggestions.append(SuggestionItem(
            category="Links",
            severity="low",
            suggestion="Add your LinkedIn profile URL near your contact information.",
        ))

    # Summary
    completeness = breakdown_by_category.get("Section Completeness")
    if completeness and "Summary/Objective" in completeness.explanation:
        suggestions.append(SuggestionItem(
            category="Summary",
            severity="medium",
            suggestion=(
                "Add a concise 2-3 sentence professional summary at the top of "
                "your resume highlighting your role, key skills, and career goal."
            ),
        ))

    # Certifications
    cert = breakdown_by_category.get("Certifications")
    if cert and cert.score == 0:
        suggestions.append(SuggestionItem(
            category="Certifications",
            severity="low",
            suggestion=(
                "If you have completed relevant certifications or online courses "
                "(e.g. AWS, Coursera, Google), list them in a Certifications section."
            ),
        ))

    # Formatting
    fmt = breakdown_by_category.get("Formatting")
    if fmt and fmt.score < fmt.max_score * 0.6:
        suggestions.append(SuggestionItem(
            category="Formatting",
            severity="medium",
            suggestion=(
                "Use bullet points instead of long paragraphs, and aim for a "
                "resume length of roughly 400-800 words for better ATS parsing "
                "and recruiter readability."
            ),
        ))

    # Education
    edu = breakdown_by_category.get("Education")
    if edu and edu.score < edu.max_score * 0.5:
        suggestions.append(SuggestionItem(
            category="Education",
            severity="medium",
            suggestion="Add a clearly labeled Education section with degree, institution, and graduation year.",
        ))

    if not suggestions:
        suggestions.append(SuggestionItem(
            category="General",
            severity="low",
            suggestion="Your resume covers the key sections well. Consider tailoring skill keywords further to each specific job description.",
        ))

    return suggestions
