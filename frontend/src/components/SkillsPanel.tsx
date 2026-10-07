import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import type { SkillCoverage } from "@/types";
import { motion } from "framer-motion";

export default function SkillsPanel({ skills }: { skills: SkillCoverage }) {
  const coverageColor =
    skills.coverage_percent >= 70
      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
      : skills.coverage_percent >= 40
        ? "text-amber-600 bg-amber-50 border-amber-100"
        : "text-red-600 bg-red-50 border-red-100";

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-soft p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <Sparkles size={14} className="text-violet-500" />
          </div>
          <h3 className="font-semibold text-ink dark:text-dark-ink text-[14px]">Skill Coverage</h3>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${coverageColor}`}>
          {skills.coverage_percent}% coverage
        </span>
      </div>

      {/* Coverage progress bar */}
      <div className="mb-5">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-grad-primary"
            initial={{ width: 0 }}
            animate={{ width: `${skills.coverage_percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted dark:text-dark-muted mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Matched Skills */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-semibold mb-2.5">
          <CheckCircle2 size={14} />
          Matched Skills ({skills.matched_skills.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skills.matched_skills.length === 0 && (
            <span className="text-[12px] text-muted dark:text-dark-muted">No matches found.</span>
          )}
          {skills.matched_skills.map((s) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-xl"
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      <div>
        <div className="flex items-center gap-1.5 text-red-500 text-[12px] font-semibold mb-2.5">
          <XCircle size={14} />
          Missing Skills ({skills.missing_skills.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skills.missing_skills.length === 0 && (
            <span className="text-[12px] text-muted dark:text-dark-muted">
              {skills.jd_skill_count === 0
                ? "Add a job description to see missing skills."
                : "Great coverage — nothing missing!"}
            </span>
          )}
          {skills.missing_skills.map((s) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[11px] font-medium bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-xl"
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
