import axios from "axios";
import type { AnalysisResult, UploadResponse } from "@/types";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function unwrapError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    let msg = "Something went wrong. Please try again.";
    if (typeof detail === "string") {
      msg = detail;
    } else if (Array.isArray(detail)) {
      msg = detail.map((d: any) => d.msg).join(", ");
    }
    throw new ApiError(msg, err.response?.status);
  }
  throw new ApiError("Network error. Is the backend running?");
}

export async function uploadResume(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  try {
    const { data } = await api.post<UploadResponse>("/upload-resume", form);
    return data;
  } catch (err) {
    unwrapError(err);
  }
}

export async function uploadJobDescription(
  input: { file?: File; text?: string }
): Promise<UploadResponse> {
  const form = new FormData();
  if (input.file) form.append("file", input.file);
  if (input.text) form.append("text", input.text);
  try {
    const { data } = await api.post<UploadResponse>("/upload-job-description", form);
    return data;
  } catch (err) {
    unwrapError(err);
  }
}

export async function analyzeResume(payload: {
  resume_file_id: string;
  jd_file_id?: string;
  jd_text?: string;
}): Promise<AnalysisResult> {
  try {
    const { data } = await api.post<AnalysisResult>("/analyze", payload);
    return data;
  } catch (err) {
    unwrapError(err);
  }
}

export function reportDownloadUrl(analysisId: string): string {
  return `/api/report/${analysisId}`;
}

export async function downloadReport(analysisId: string): Promise<void> {
  try {
    const response = await api.get(`/report/${analysisId}`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-analysis-${analysisId.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    unwrapError(err);
  }
}
