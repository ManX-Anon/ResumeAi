"""
pdf_generator.py

Builds a professional PDF report summarizing the resume analysis:
scores, matched/missing skills, suggestions, and embedded charts
(rendered via Plotly + Kaleido, then placed into the PDF via ReportLab).
"""
from __future__ import annotations

import io
from datetime import datetime
from typing import Optional

import plotly.graph_objects as go
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage,
    HRFlowable,
)

from app.models.schemas import AnalysisResult

PRIMARY = colors.HexColor("#5B4BFF")
SUCCESS = colors.HexColor("#22C55E")
DANGER = colors.HexColor("#EF4444")
MUTED = colors.HexColor("#64748B")


def _fig_to_image_flowable(fig: go.Figure, width_mm: float = 150) -> Optional[RLImage]:
    try:
        img_bytes = fig.to_image(format="png", width=900, height=500, scale=2)
    except Exception:
        # Kaleido may not be able to render in some sandboxed environments;
        # degrade gracefully by skipping the chart rather than failing the report.
        return None
    buf = io.BytesIO(img_bytes)
    return RLImage(buf, width=width_mm * mm, height=(width_mm * 0.55) * mm)


def _build_pie_chart(result: AnalysisResult) -> go.Figure:
    labels = result.charts.skill_match_pie.labels
    values = result.charts.skill_match_pie.values
    fig = go.Figure(data=[go.Pie(
        labels=labels, values=values, hole=0.45,
        marker=dict(colors=["#5B4BFF", "#EF4444"]),
    )])
    fig.update_layout(title="Skill Match", margin=dict(t=50, b=10, l=10, r=10))
    return fig


def _build_radar_chart(result: AnalysisResult) -> go.Figure:
    labels = result.charts.ats_radar.labels
    values = result.charts.ats_radar.values
    fig = go.Figure(data=go.Scatterpolar(
        r=values, theta=labels, fill="toself", line_color="#5B4BFF",
    ))
    fig.update_layout(
        title="ATS Score Breakdown",
        polar=dict(radialaxis=dict(visible=True, range=[0, max(values) if values else 10])),
        margin=dict(t=50, b=10, l=30, r=30),
    )
    return fig


def _build_bar_chart(result: AnalysisResult) -> go.Figure:
    labels = result.charts.skill_distribution_bar.labels
    values = result.charts.skill_distribution_bar.values
    fig = go.Figure(data=[go.Bar(x=labels, y=values, marker_color="#3B82F6")])
    fig.update_layout(title="Skill Frequency in Resume", margin=dict(t=50, b=80, l=30, r=10))
    return fig


def generate_pdf_report(result: AnalysisResult, resume_filename: str = "resume") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=18 * mm, bottomMargin=18 * mm,
        leftMargin=18 * mm, rightMargin=18 * mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleCustom", parent=styles["Title"], textColor=PRIMARY, fontSize=22,
    )
    heading_style = ParagraphStyle(
        "HeadingCustom", parent=styles["Heading2"], textColor=PRIMARY, spaceBefore=14, spaceAfter=6,
    )
    body_style = ParagraphStyle("BodyCustom", parent=styles["BodyText"], fontSize=10, leading=14)
    muted_style = ParagraphStyle("Muted", parent=styles["BodyText"], fontSize=9, textColor=MUTED)

    elements = []

    # --- Header / Logo ---
    elements.append(Paragraph("Resume Analyzer", title_style))
    elements.append(Paragraph("AI-Powered ATS-Style Resume Analysis Report", muted_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        f"Resume file: <b>{resume_filename}</b> &nbsp;|&nbsp; "
        f"Analyzed: {result.analyzed_at}", muted_style,
    ))
    elements.append(HRFlowable(width="100%", color=PRIMARY, thickness=1, spaceBefore=8, spaceAfter=10))

    # --- Score summary table ---
    score_data = [
        ["Resume Match Score", f"{result.resume_match_score}%"],
        ["ATS-Style Score", f"{result.ats_score.total_score} / {result.ats_score.max_score}"],
        ["Matched Skills", str(len(result.skills.matched_skills))],
        ["Missing Skills", str(len(result.skills.missing_skills))],
    ]
    score_table = Table(score_data, colWidths=[90 * mm, 60 * mm])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#0F172A")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (1, 0), (1, -1), PRIMARY),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(score_table)

    # --- Charts ---
    elements.append(Paragraph("Visual Breakdown", heading_style))
    for fig_builder in (_build_pie_chart, _build_radar_chart, _build_bar_chart):
        fig = fig_builder(result)
        img = _fig_to_image_flowable(fig)
        if img:
            elements.append(img)
            elements.append(Spacer(1, 8))

    # --- ATS breakdown table ---
    elements.append(Paragraph("ATS Score Breakdown", heading_style))
    ats_rows = [["Category", "Score", "Explanation"]]
    for item in result.ats_score.breakdown:
        ats_rows.append([item.category, f"{item.score}/{item.max_score}", item.explanation])
    ats_table = Table(ats_rows, colWidths=[35 * mm, 20 * mm, 105 * mm])
    ats_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    elements.append(ats_table)
    elements.append(Paragraph(result.ats_score.disclaimer, muted_style))

    # --- Skills ---
    elements.append(Paragraph("Matched Skills", heading_style))
    elements.append(Paragraph(
        ", ".join(result.skills.matched_skills) or "None detected", body_style,
    ))
    elements.append(Paragraph("Missing Skills", heading_style))
    elements.append(Paragraph(
        ", ".join(result.skills.missing_skills) or "None — great coverage!", body_style,
    ))

    # --- Suggestions ---
    elements.append(Paragraph("Improvement Suggestions", heading_style))
    for s in result.suggestions:
        bullet = f"<b>[{s.severity.upper()}] {s.category}:</b> {s.suggestion}"
        elements.append(Paragraph(bullet, body_style))
        elements.append(Spacer(1, 3))

    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", color=colors.HexColor("#E2E8F0"), thickness=0.5))
    elements.append(Paragraph(
        "Generated by Resume Analyzer — an educational AI/ML portfolio project.",
        muted_style,
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
