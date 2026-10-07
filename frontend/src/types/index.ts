export interface UploadResponse {
  file_id: string;
  filename: string;
  file_type: string;
  characters_extracted: number;
  preview: string;
  message: string;
}

export interface SkillCoverage {
  matched_skills: string[];
  missing_skills: string[];
  resume_skill_count: number;
  jd_skill_count: number;
  coverage_percent: number;
}

export interface ATSBreakdownItem {
  category: string;
  score: number;
  max_score: number;
  explanation: string;
}

export interface ATSResult {
  total_score: number;
  max_score: number;
  breakdown: ATSBreakdownItem[];
  disclaimer: string;
}

export interface SuggestionItem {
  category: string;
  severity: "high" | "medium" | "low";
  suggestion: string;
}

export interface ChartSeries {
  labels: string[];
  values: number[];
}

export interface ChartsData {
  skill_match_pie: ChartSeries;
  ats_radar: ChartSeries;
  skill_distribution_bar: ChartSeries;
}

export interface AnalysisResult {
  analysis_id: string;
  resume_match_score: number;
  ats_score: ATSResult;
  skills: SkillCoverage;
  suggestions: SuggestionItem[];
  charts: ChartsData;
  analyzed_at: string;
}
