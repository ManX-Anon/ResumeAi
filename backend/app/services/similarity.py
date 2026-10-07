"""
similarity.py

Computes the Resume <-> Job Description match score using TF-IDF
vectorization and cosine similarity — a classic, explainable IR
technique well suited to an ATS-style tool.
"""
from __future__ import annotations

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.preprocessing import preprocess_to_string


def compute_match_score(resume_text: str, jd_text: str) -> float:
    """Returns a 0-100 match percentage between resume and job description."""
    resume_clean = preprocess_to_string(resume_text)
    jd_clean = preprocess_to_string(jd_text)

    if not resume_clean.strip() or not jd_clean.strip():
        return 0.0

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
    )

    try:
        tfidf_matrix = vectorizer.fit_transform([resume_clean, jd_clean])
    except ValueError:
        # Happens if vocabulary ends up empty after preprocessing
        return 0.0

    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    score = round(float(similarity) * 100, 2)
    return max(0.0, min(100.0, score))
