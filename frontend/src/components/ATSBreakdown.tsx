import { motion } from "framer-motion";
import type { ATSResult } from "@/types";
import { Shield, TrendingUp } from "lucide-react";

function barColor(pct: number) {
  if (pct >= 75) return { bar: "#10b981", bg: "#ecfdf5", text: "#059669" };
  if (pct >= 45) return { bar: "#f59e0b", bg: "#fffbeb", text: "#d97706" };
  return { bar: "#ef4444", bg: "#fef2f2", text: "#dc2626" };
}

export default function ATSBreakdown({ ats }: { ats: ATSResult }) {
  const overallPct = (ats.total_score / ats.max_score) * 100;
  const { bar: overallColor, text: overallText } = barColor(overallPct);

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-soft p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
            <Shield size={14} className="text-primary-500" />
          </div>
          <h3 className="font-semibold text-ink dark:text-dark-ink text-[14px]">ATS Breakdown</h3>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold" style={{ color: overallColor }}>
            {ats.total_score}
          </span>
          <span className="text-[12px] text-muted dark:text-dark-muted">/{ats.max_score}</span>
        </div>
      </div>
      <p className="text-[11px] text-muted dark:text-dark-muted mb-4 leading-relaxed pl-9">{ats.disclaimer}</p>

      {/* Bars */}
      <div className="flex flex-col gap-4">
        {ats.breakdown.map((item) => {
          const pct = (item.score / item.max_score) * 100;
          const { bar, bg, text } = barColor(pct);
          return (
            <div key={item.category}>
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="font-medium text-ink dark:text-dark-ink">{item.category}</span>
                <span
                  className="font-semibold px-2 py-0.5 rounded-lg text-[11px]"
                  style={{ color: text, backgroundColor: bg }}
                >
                  {item.score}/{item.max_score}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-600 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: bar }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                />
              </div>
              <p className="text-[11px] text-muted dark:text-dark-muted mt-1 leading-relaxed">{item.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
