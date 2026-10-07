import { Bell, Sun, Moon, Menu, Search, Command, Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-white/90 dark:bg-dark-card/90 glass dark:glass-dark border-b border-slate-100 dark:border-dark-border">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={18} className="text-muted" />
        </button>

        {/* Search bar */}
        <div className="relative flex-1 hidden sm:flex items-center">
          <Search size={15} className="absolute left-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search resumes, skills, reports..."
            className="w-full pl-9 pr-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-ink placeholder:text-muted focus:outline-none focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
          />
          <div className="absolute right-3 flex items-center gap-0.5 text-muted">
            <Command size={11} />
            <span className="text-[11px] font-medium">K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 ml-4">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-ink transition-colors"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-ink transition-colors"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full dark:border-slate-700 border-white" />
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-grad-primary flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
            RA
          </div>
        </div>
      </div>
    </header>
  );
}
