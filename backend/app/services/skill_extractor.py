"""
skill_extractor.py

Extracts canonical technical skills from raw text by matching against
the SKILL_TAXONOMY. Uses simple, robust substring/phrase matching over
cleaned text rather than a heavier NER model, so it works with zero
extra downloads and stays predictable/explainable (important for an
ATS-style, interpretable tool).
"""
from __future__ import annotations

import re
from typing import List, Set

from app.services.preprocessing import clean_text
from app.services.skill_taxonomy import SKILL_TAXONOMY


def _phrase_pattern(phrase: str) -> re.Pattern:
    """Build a word-boundary-safe regex for a skill alias, tolerant of
    symbols like '++', '#', '.' that \\b handles poorly."""
    escaped = re.escape(phrase)
    # Use lookaround boundaries that work even when the phrase starts/ends
    # with non-word characters (e.g. "c++", "c#").
    return re.compile(rf"(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])")


_COMPILED_PATTERNS = {
    canonical: [_phrase_pattern(alias) for alias in aliases]
    for canonical, aliases in SKILL_TAXONOMY.items()
}


def extract_skills(text: str) -> List[str]:
    cleaned = clean_text(text)
    found: Set[str] = set()

    for canonical, patterns in _COMPILED_PATTERNS.items():
        for pattern in patterns:
            if pattern.search(cleaned):
                found.add(canonical)
                break

    # Return in taxonomy order for stable, readable output
    return [s for s in SKILL_TAXONOMY.keys() if s in found]


def skill_frequency(text: str) -> dict:
    """Count occurrences of each matched skill's aliases — used for the
    skill-distribution bar chart."""
    cleaned = clean_text(text)
    freq = {}
    for canonical, patterns in _COMPILED_PATTERNS.items():
        count = sum(len(p.findall(cleaned)) for p in patterns)
        if count > 0:
            freq[canonical] = count
    return freq
