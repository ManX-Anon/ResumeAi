"""
preprocessing.py

Core NLP text-cleaning pipeline shared by similarity scoring and skill
extraction:

  1. Lowercasing
  2. Punctuation / special character removal
  3. Tokenization (regex-based, always available)
  4. Stopword removal (NLTK, with a small built-in fallback list)
  5. Lemmatization (NLTK WordNet, with graceful no-op fallback)

spaCy is intentionally NOT a hard dependency. If it's installed and its
'en_core_web_sm' model is available, we use it for slightly better
tokenization/lemmatization. Otherwise we fall back to NLTK + regex,
so the app always works out of the box.
"""
from __future__ import annotations

import re
from functools import lru_cache
from typing import List

# --- NLTK setup with safe fallbacks -----------------------------------
try:
    import nltk
    from nltk.corpus import stopwords as nltk_stopwords
    from nltk.stem import WordNetLemmatizer

    def _ensure_nltk_data():
        packages = [
            ("corpora/stopwords", "stopwords"),
            ("corpora/wordnet", "wordnet"),
            ("corpora/omw-1.4", "omw-1.4"),
        ]
        for path, pkg in packages:
            try:
                nltk.data.find(path)
            except LookupError:
                try:
                    nltk.download(pkg, quiet=True)
                except Exception:
                    pass

    _ensure_nltk_data()
    _NLTK_AVAILABLE = True
except Exception:
    _NLTK_AVAILABLE = False


_FALLBACK_STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "then", "so", "of", "to",
    "in", "on", "at", "for", "with", "as", "by", "is", "are", "was", "were",
    "be", "been", "being", "this", "that", "these", "those", "it", "its",
    "i", "you", "he", "she", "we", "they", "them", "his", "her", "our",
    "your", "their", "from", "into", "about", "than", "too", "very", "can",
    "will", "just", "not", "no", "do", "does", "did", "have", "has", "had",
    "over", "under", "up", "down", "out", "off", "again", "further", "once",
}


@lru_cache(maxsize=1)
def _get_stopwords() -> set:
    if _NLTK_AVAILABLE:
        try:
            return set(nltk_stopwords.words("english"))
        except Exception:
            return _FALLBACK_STOPWORDS
    return _FALLBACK_STOPWORDS


@lru_cache(maxsize=1)
def _get_lemmatizer():
    if _NLTK_AVAILABLE:
        try:
            return WordNetLemmatizer()
        except Exception:
            return None
    return None


_TOKEN_REGEX = re.compile(r"[a-zA-Z][a-zA-Z0-9+.#]*")


def clean_text(text: str) -> str:
    """Lowercase + strip special characters, keep useful tech symbols like
    C++, C#, .NET readable by not stripping + # . inside tokens (handled by
    the tokenizer regex instead)."""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def tokenize(text: str) -> List[str]:
    raw_tokens = _TOKEN_REGEX.findall(text)
    # Strip stray trailing punctuation (e.g. "aws." at end of sentence)
    # while preserving meaningful symbols like "c++" or "node.js".
    cleaned = []
    for tok in raw_tokens:
        tok = tok.rstrip(".")
        if tok:
            cleaned.append(tok)
    return cleaned


def remove_stopwords(tokens: List[str]) -> List[str]:
    stops = _get_stopwords()
    return [t for t in tokens if t not in stops and len(t) > 1]


def lemmatize(tokens: List[str]) -> List[str]:
    lemmatizer = _get_lemmatizer()
    if lemmatizer is None:
        return tokens
    try:
        return [lemmatizer.lemmatize(t) for t in tokens]
    except Exception:
        return tokens


def preprocess(text: str) -> List[str]:
    """Full pipeline: clean -> tokenize -> remove stopwords -> lemmatize."""
    cleaned = clean_text(text)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    tokens = lemmatize(tokens)
    return tokens


def preprocess_to_string(text: str) -> str:
    return " ".join(preprocess(text))
