import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ScoreRingCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  color: string;
  subtext?: string;
}

export default function ScoreRingCard({ label, value, suffix = "%", icon: Icon, color, subtext }: ScoreRingCardProps) {
  // Derive a light bg from the color
  const bgMap: Record<string, string> = {
    "#6366f1": "#eef2ff",
    "#8b5cf6": "#f5f3ff",
    "#10b981": "#ecfdf5",
    "#ef4444": "#fef2f2",
  };
  const bg = bgMap[color] ?? "#f8fafc";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-soft p-5 flex items-center gap-4 card-hover"
    >
      <div className="w-14 h-14 shrink-0">
        <CircularProgressbar
          value={suffix === "%" ? value : Math.min((value / 20) * 100, 100)}
          maxValue={100}
          text={`${Math.round(value)}`}
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: "#f1f5f9",
            textSize: "28px",
            pathTransitionDuration: 0.8,
          })}
        />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: bg }}
          >
            <Icon size={13} style={{ color }} />
          </div>
          <p className="text-[11px] font-medium text-muted dark:text-dark-muted truncate leading-tight">{label}</p>
        </div>
        <p className="text-2xl font-bold text-ink dark:text-dark-ink leading-none">
          {Math.round(value)}
          {suffix && <span className="text-sm font-medium text-muted dark:text-dark-muted ml-0.5">{suffix}</span>}
        </p>
        {subtext && <p className="text-[11px] text-muted dark:text-dark-muted mt-0.5">{subtext}</p>}
      </div>
    </motion.div>
  );
}
