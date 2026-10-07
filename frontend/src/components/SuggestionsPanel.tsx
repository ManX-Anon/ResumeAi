import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Info, ArrowUpCircle, type LucideIcon } from "lucide-react";
import type { SuggestionItem } from "@/types";
import type { FC } from "react";

const SEVERITY_CONFIG: Record<
  string,
  { badge: string; dot: string; icon: LucideIcon }
> = {
  high: {
    badge: "bg-red-50 text-red-600 border-red-100",
    dot: "bg-red-400",
    icon: AlertTriangle,
  },
  medium: {
    badge: "bg-amber-50 text-amber-600 border-amber-100",
    dot: "bg-amber-400",
    icon: ArrowUpCircle,
  },
  low: {
    badge: "bg-blue-50 text-blue-600 border-blue-100",
    dot: "bg-blue-400",
    icon: Info,
  },
};

export default function SuggestionsPanel({ suggestions }: { suggestions: SuggestionItem[] }) {
  const highCount = suggestions.filter((s) => s.severity === "high").length;
  const medCount = suggestions.filter((s) => s.severity === "medium").length;

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-soft p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Lightbulb size={14} className="text-amber-500" />
          </div>
          <h3 className="font-semibold text-ink dark:text-dark-ink text-[14px]">AI Suggestions</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {highCount > 0 && (
            <span className="text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-lg">
              {highCount} High
            </span>
          )}
          {medCount > 0 && (
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-lg">
              {medCount} Medium
            </span>
          )}
        </div>
      </div>

      {/* Suggestion list */}
      <div className="flex flex-col gap-2.5">
        {suggestions.map((s, i) => {
          const config = SEVERITY_CONFIG[s.severity] ?? SEVERITY_CONFIG.low;
          const SeverityIcon = config.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-dark-border hover:border-primary-100 hover:bg-primary-50/20 dark:hover:bg-slate-700 transition-all group cursor-default"
            >
              <div
                className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center border ${config.badge}`}
              >
                <SeverityIcon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[12px] font-semibold text-ink dark:text-dark-ink">{s.category}</p>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${config.badge}`}
                  >
                    {s.severity}
                  </span>
                </div>
                <p className="text-[12px] text-muted dark:text-dark-muted leading-relaxed">{s.suggestion}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
