import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Download,
  Target,
  Gauge,
  ListChecks,
  XOctagon,
  AlertCircle,
  UploadCloud,
  MessageSquareText,
  FileText,
  Zap,
  Clock,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  RefreshCw,
  Activity,
} from "lucide-react";

import UploadCard from "@/components/UploadCard";
import ScoreRingCard from "@/components/ScoreRingCard";
import { SkillMatchPie, ATSRadarChart, SkillDistributionBar } from "@/components/Charts";
import ATSBreakdown from "@/components/ATSBreakdown";
import SkillsPanel from "@/components/SkillsPanel";
import SuggestionsPanel from "@/components/SuggestionsPanel";

import { uploadResume, uploadJobDescription, analyzeResume, downloadReport, ApiError } from "@/services/api";
import type { AnalysisResult } from "@/types";

type UploadStatus = "idle" | "uploading" | "done" | "error";

interface DashboardProps {
  userName?: string | null;
  onResult?: (result: AnalysisResult) => void;
  onResumeUploaded?: () => void;
}

const QUICK_ACTIONS = [
  {
    icon: UploadCloud,
    label: "Upload Resume",
    desc: "Upload PDF, DOCX or TXT",
    color: "bg-primary-50 text-primary-600",
    gradient: "from-primary-500 to-violet-500",
    id: "upload",
  },
  {
    icon: MessageSquareText,
    label: "Add Job Description",
    desc: "Paste text or upload file",
    color: "bg-violet-50 text-violet-600",
    gradient: "from-violet-500 to-primary-500",
    id: "jd",
  },
  {
    icon: Zap,
    label: "Analyze Resume",
    desc: "Get instant AI scores",
    color: "bg-cyan-50 text-cyan-600",
    gradient: "from-cyan-500 to-primary-500",
    id: "analyze",
  },
  {
    icon: FileText,
    label: "Download Report",
    desc: "Export full PDF report",
    color: "bg-emerald-50 text-emerald-600",
    gradient: "from-emerald-500 to-cyan-500",
    id: "report",
  },
];

const RECENT_ACTIVITY = [
  { icon: UploadCloud, color: "bg-primary-100 text-primary-600", text: "Upload your resume to begin analysis", time: "Just now" },
  { icon: MessageSquareText, color: "bg-violet-100 text-violet-600", text: "Add a job description for targeted matching", time: "" },
  { icon: Zap, color: "bg-cyan-100 text-cyan-600", text: "Run AI analysis to see your ATS score", time: "" },
];

export default function Dashboard({ userName, onResult, onResumeUploaded }: DashboardProps) {
  const [resumeFileId, setResumeFileId] = useState<string | null>(null);
  const [resumeStatus, setResumeStatus] = useState<UploadStatus>("idle");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [jdFileId, setJdFileId] = useState<string | null>(null);
  const [jdText, setJdText] = useState<string>("");
  const [jdStatus, setJdStatus] = useState<UploadStatus>("idle");
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleResumeFile(file: File) {
    setResumeStatus("uploading");
    setResumeError(null);
    try {
      const res = await uploadResume(file);
      setResumeFileId(res.file_id);
      setResumeFileName(res.filename);
      setResumeStatus("done");
      onResumeUploaded?.();
    } catch (err) {
      setResumeStatus("error");
      setResumeError(err instanceof ApiError ? err.message : "Upload failed.");
    }
  }

  async function handleJdFile(file: File) {
    setJdStatus("uploading");
    setJdError(null);
    try {
      const res = await uploadJobDescription({ file });
      setJdFileId(res.file_id);
      setJdFileName(res.filename);
      setJdStatus("done");
    } catch (err) {
      setJdStatus("error");
      setJdError(err instanceof ApiError ? err.message : "Upload failed.");
    }
  }

  async function handleAnalyze() {
    if (!resumeFileId) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      let effectiveJdFileId = jdFileId ?? undefined;
      if (!effectiveJdFileId && jdText.trim().length >= 20) {
        const res = await uploadJobDescription({ text: jdText });
        effectiveJdFileId = res.file_id;
      }
      const analysis = await analyzeResume({
        resume_file_id: resumeFileId,
        jd_file_id: effectiveJdFileId,
      });
      setResult(analysis);
      onResult?.(analysis);
    } catch (err) {
      setAnalysisError(err instanceof ApiError ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  const canAnalyze = !!resumeFileId && !analyzing;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">

      {/* ── Hero Greeting ── */}
      <section id="overview">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-ink dark:text-dark-ink">
            {greeting}, <span className="gradient-text">{userName || "Candidate"}!</span> 👋
          </h2>
          <p className="text-sm text-muted dark:text-dark-muted mt-1">Let's optimize your resume for your dream job.</p>
        </motion.div>
      </section>

      {/* ── Quick Action Cards ── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, color, gradient, id }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 cursor-pointer card-hover shadow-soft group"
              onClick={() => {
                const targetId = id === "analyze" ? "analyze-btn" : id;
                let el = document.getElementById(targetId);
                if (!el) el = document.getElementById("upload"); // fallback if not generated yet
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
              </div>
              <p className="text-[13px] font-semibold text-ink dark:text-dark-ink leading-tight">{label}</p>
              <p className="text-[11px] text-muted dark:text-dark-muted mt-0.5">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Upload Section ── */}
      <section id="upload">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-ink dark:text-dark-ink">Resume & Job Description</h3>
          {(resumeStatus === "done" || jdStatus === "done") && (
            <button
              onClick={() => {
                setResumeFileId(null); setResumeStatus("idle"); setResumeFileName(null); setResumeError(null);
                setJdFileId(null); setJdStatus("idle"); setJdFileName(null); setJdError(null);
                setResult(null); setAnalysisError(null);
              }}
              className="text-xs text-muted dark:text-dark-muted hover:text-danger flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Reset
            </button>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <UploadCard
            title="Upload Resume"
            description="PDF or DOCX, up to 8MB"
            status={resumeStatus}
            fileName={resumeFileName}
            errorMessage={resumeError}
            onFileSelected={handleResumeFile}
          />
          <UploadCard
            title="Job Description"
            description="Paste text or upload PDF/DOCX"
            allowPasteText
            status={jdStatus}
            fileName={jdFileName}
            errorMessage={jdError}
            onFileSelected={handleJdFile}
            onTextChange={(t) => setJdText(t)}
          />
        </div>
      </section>

      {/* ── Analyze Button ── */}
      <div className="flex flex-col items-center gap-3" id="analyze-btn">
        <motion.button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          whileHover={canAnalyze ? { scale: 1.02 } : {}}
          whileTap={canAnalyze ? { scale: 0.98 } : {}}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-grad-primary text-white font-semibold text-sm shadow-lift disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {analyzing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Analyzing Resume…
            </>
          ) : (
            <>
              <Zap size={16} />
              Analyze Resume
            </>
          )}
        </motion.button>

        {!resumeFileId && (
          <p className="text-xs text-muted dark:text-dark-muted flex items-center gap-1.5">
            <AlertCircle size={13} className="text-muted" />
            Upload a resume to get started
          </p>
        )}
        {analysisError && (
          <p className="text-xs text-danger flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
            <XOctagon size={13} /> {analysisError}
          </p>
        )}
      </div>

      {/* ── Results (shown after analysis) ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            {/* Stats Bar */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ScoreRingCard
                label="Resume Match Score"
                value={result.resume_match_score}
                icon={Target}
                color="#6366f1"
              />
              <ScoreRingCard
                label="ATS-Style Score"
                value={result.ats_score.total_score}
                icon={Gauge}
                color="#8b5cf6"
              />
              <ScoreRingCard
                label="Skills Found"
                value={result.skills.resume_skill_count}
                suffix=""
                icon={ListChecks}
                color="#10b981"
              />
              <ScoreRingCard
                label="Missing Skills"
                value={result.skills.missing_skills.length}
                suffix=""
                icon={XOctagon}
                color="#ef4444"
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-4">
              {[
                { component: <SkillMatchPie data={result.charts.skill_match_pie} /> },
                { component: <ATSRadarChart breakdown={result.ats_score.breakdown} /> },
                { component: <SkillDistributionBar data={result.charts.skill_distribution_bar} /> },
              ].map((chart, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-soft p-4"
                >
                  {chart.component}
                </motion.div>
              ))}
            </div>

            {/* ATS + Skills */}
            <div id="skills" className="grid lg:grid-cols-2 gap-4">
              <ATSBreakdown ats={result.ats_score} />
              <SkillsPanel skills={result.skills} />
            </div>

            {/* Suggestions */}
            <div id="suggestions">
              <SuggestionsPanel suggestions={result.suggestions} />
            </div>

            {/* Download Report */}
            <div id="report" className="rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-soft p-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink dark:text-dark-ink text-[14px]">Download Full Report</h3>
                  <p className="text-[12px] text-muted dark:text-dark-muted mt-0.5">
                    Professional PDF with all scores, charts, and suggestions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadReport(result.analysis_id).catch(() => alert("Failed to download report. Please re-analyze your resume first."))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-soft cursor-pointer"
              >
                <Download size={15} /> Download PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recent Activity (shown before analysis) ── */}
      {!result && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-ink dark:text-dark-ink">Getting Started</h3>
          </div>
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl shadow-soft overflow-hidden">
            {RECENT_ACTIVITY.map(({ icon: Icon, color, text, time }, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${i < RECENT_ACTIVITY.length - 1 ? "border-b border-slate-50 dark:border-slate-600" : ""
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={15} />
                </div>
                <p className="flex-1 text-[13px] text-muted dark:text-dark-muted">{text}</p>
                {time && <span className="text-[11px] text-slate-400 dark:text-slate-400 shrink-0">{time}</span>}
                <ChevronRight size={14} className="text-slate-300 dark:text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Weekly Stats (shown before analysis) ── */}
      {!result && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-ink dark:text-dark-ink">Platform Stats</h3>
            <span className="text-[12px] text-muted dark:text-dark-muted bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">This Week</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Resumes Analyzed", value: "2.4K+", trend: "+18%", icon: FileText, color: "text-primary-500", bg: "bg-primary-50" },
              { label: "Avg Match Score", value: "72%", trend: "+5%", icon: Target, color: "text-violet-500", bg: "bg-violet-50" },
              { label: "Skills Detected", value: "340+", trend: "+42%", icon: Sparkles, color: "text-cyan-500", bg: "bg-cyan-50" },
              { label: "Reports Generated", value: "890", trend: "+28%", icon: Download, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Avg ATS Score", value: "68/100", trend: "+8%", icon: Gauge, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Success Rate", value: "94%", trend: "+12%", icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-50" },
            ].map(({ label, value, trend, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-4 shadow-soft"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon size={15} className={color} />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
                    ↑ {trend}
                  </span>
                </div>
                <p className="text-xl font-bold text-ink dark:text-dark-ink leading-none">{value}</p>
                <p className="text-[11px] text-muted dark:text-dark-muted mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
