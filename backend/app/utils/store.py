"""
store.py

A minimal in-memory store keyed by UUID, used to pass extracted text and
analysis results between the /upload, /analyze, and /report endpoints
within a single running server process.

NOTE: This is intentionally simple for a portfolio project. In a real
production deployment this would be backed by Redis or a database with
TTL-based expiry.
"""
from __future__ import annotations

import uuid
from typing import Any, Dict, Optional


class InMemoryStore:
    def __init__(self) -> None:
        self._data: Dict[str, Any] = {}

    def put(self, value: Any, key: Optional[str] = None) -> str:
        key = key or str(uuid.uuid4())
        self._data[key] = value
        return key

    def get(self, key: str) -> Optional[Any]:
        return self._data.get(key)

    def exists(self, key: str) -> bool:
        return key in self._data


file_store = InMemoryStore()      # holds extracted text of uploaded files
analysis_store = InMemoryStore()  # holds completed AnalysisResult objects
