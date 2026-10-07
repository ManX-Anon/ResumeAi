# HireWise — AI/ML Resume Screening & ATS-Style Analyzer

A full-stack AI/ML application that compares a resume against a job description,
computes a TF-IDF/cosine similarity match score, an explainable ATS-style score,
missing-skill analysis, dynamic improvement suggestions, interactive charts, and
a downloadable PDF report — built as an AI/ML internship portfolio project.

## Overview

| Layer | Stack |
|---|---|
| Backend | Python 3.12, FastAPI, scikit-learn, NLTK, pandas, pdfplumber/PyPDF2, python-docx, ReportLab, Plotly |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Plotly.js, Lucide icons |

## Features

- **Resume upload** — PDF & DOCX, with validation and text extraction
- **Job description input** — paste text or upload PDF/DOCX
- **NLP preprocessing** — lowercasing, tokenization, stopword removal, lemmatization
- **Skill extraction** — 35+ technical skills matched via an expandable taxonomy
- **Resume match score** — TF-IDF vectorization + cosine similarity
- **Missing skill analysis** — matched vs. missing skills, coverage %
- **ATS-style score (/100)** — weighted, explainable breakdown across Skills,
  Experience, Projects, Education, Formatting, Certifications, and Section
  Completeness — clearly labeled as an *educational estimate*, not a simulation
  of any specific commercial ATS
- **Dynamic suggestions** — generated from the actual analysis, not hardcoded
- **Interactive charts** — skill-match pie, ATS radar, skill-frequency bar
- **PDF report** — professional report with charts, scores, and suggestions

## Folder Structure

```
resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entrypoint
│   │   ├── routes/
│   │   │   ├── upload.py           # /upload-resume, /upload-job-description
│   │   │   ├── analysis.py         # /analyze
│   │   │   └── report.py           # /report/{analysis_id}
│   │   ├── services/
│   │   │   ├── resume_parser.py    # PDF/DOCX extraction
│   │   │   ├── jd_parser.py
│   │   │   ├── preprocessing.py    # NLP pipeline
│   │   │   ├── skill_taxonomy.py   # expandable skill list
│   │   │   ├── skill_extractor.py
│   │   │   ├── similarity.py       # TF-IDF + cosine similarity
│   │   │   ├── ats_score.py        # rule-based ATS scoring
│   │   │   ├── suggestions.py      # dynamic suggestion engine
│   │   │   └── pdf_generator.py    # ReportLab + Plotly report builder
│   │   ├── utils/store.py          # in-memory store (swap for Redis/DB in prod)
│   │   └── models/schemas.py       # Pydantic request/response models
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/             # Sidebar, Header, UploadCard, charts, panels
    │   ├── pages/Dashboard.tsx     # main dashboard page
    │   ├── services/api.ts         # Axios API client
    │   └── types/index.ts          # TS types mirroring backend schemas
    └── package.json
```

## Installation & Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Interactive API docs at
`http://localhost:8000/docs`.

> NLTK stopwords/wordnet data downloads automatically on first run. If your
> environment has no internet access, the preprocessing pipeline gracefully
> falls back to a built-in stopword list.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api/*` requests to the
backend at `http://localhost:8000`.

## API Documentation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload-resume` | Upload a PDF/DOCX resume; returns `file_id` + extracted preview |
| POST | `/api/upload-job-description` | Upload a PDF/DOCX or send `text` form field |
| POST | `/api/analyze` | Body: `{ resume_file_id, jd_file_id? , jd_text? }` → full `AnalysisResult` |
| GET | `/api/report/{analysis_id}` | Streams a generated PDF report |
| GET | `/api/health` | Health check |

Full request/response schemas are in `backend/app/models/schemas.py` and are
also browsable live at `/docs` (Swagger UI) once the backend is running.

## How the scoring works

- **Resume Match Score** — resume and job description are each preprocessed
  (cleaned, tokenized, stopwords removed, lemmatized), vectorized with
  scikit-learn's `TfidfVectorizer` (uni+bigrams), and compared via cosine
  similarity, scaled to 0–100%.
- **ATS-Style Score** — a transparent, rule-based heuristic scorer (not a
  simulation of any real commercial ATS) across 7 weighted categories,
  summing to 100. Every sub-score includes a plain-language explanation.
  This is clearly disclaimed in both the UI and PDF report.

## Testing Notes

Core NLP/ML logic (preprocessing, skill extraction, TF-IDF similarity, ATS
scoring, suggestion generation) has been verified with sample resume/job
description pairs to confirm sensible, explainable output. Extraction was
validated against a generated DOCX fixture covering all resume sections
(summary, experience, projects, education, skills, contact links).

## Future Improvements

- Persist uploads/analyses in Redis or Postgres instead of in-memory store
- Optional spaCy NER pipeline for richer entity extraction (job titles, orgs)
- Multi-resume batch screening & ranking against a single job description
- User accounts + analysis history
- Resume rewriting suggestions powered by an LLM
- Expandable skill taxonomy sourced from a live O*NET/ESCO dataset

## Disclaimer

The ATS-style score is an educational heuristic built for demonstration and
learning purposes. It does not replicate the proprietary scoring logic of
any commercial Applicant Tracking System (Workday, Greenhouse, Taleo, etc.).
