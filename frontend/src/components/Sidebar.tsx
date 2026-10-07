import {
  LayoutDashboard,
  FileSearch,
  Sparkles,
  FileDown,
  ScanText,
  ChevronDown,
  Brain,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "MAIN",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "upload", label: "Resume Analysis", icon: FileSearch },
      { id: "skills", label: "Skills", icon: Sparkles },
    ],
  },
  {
    label: "AI TOOLS",
    items: [
      { id: "suggestions", label: "AI Suggestions", icon: Brain },
      { id: "report", label: "Reports", icon: FileDown },
    ],
  },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  open: boolean;
  userName?: string | null;
  userEmail?: string | null;
  onLogout?: () => void;
}

export default function Sidebar({ 
  activeSection, 
  onNavigate, 
  open, 
  userName, 
  userEmail, 
  onLogout 
}: SidebarProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return "RA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" />
      )}

      <aside
        className={`fixed md:sticky top-0 h-screen w-64 shrink-0 flex flex-col bg-white dark:bg-dark-card border-r border-slate-100 dark:border-dark-border z-40 transition-transform duration-300
         ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 dark:border-dark-border shrink-0">
          <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center shadow-lift shrink-0">
            <ScanText className="text-white" size={18} />
          </div>
          <div>
            <span className="font-bold text-[15px] tracking-tight text-ink dark:text-dark-ink block leading-none">ResumeAI</span>
            <span className="text-[10px] text-muted dark:text-dark-muted">Your Intelligent Career Companion</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="text-[10px] font-semibold text-muted tracking-widest px-3 mb-1.5">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map(({ id, label, icon: Icon }) => {
                  const active = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onNavigate(id)}
                      className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all w-full text-left
                        ${active
                          ? "bg-primary-50 text-primary-600"
                          : "text-muted hover:bg-slate-50 hover:text-ink"
                        }`}
                    >
                      {active && <span className="nav-active-indicator" />}
                      <Icon
                        size={16}
                        className={active ? "text-primary-500" : "text-muted group-hover:text-ink transition-colors"}
                      />
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="shrink-0 border-t border-slate-100 dark:border-dark-border p-3">
          <button 
            onClick={onLogout}
            title="Click to logout"
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-grad-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-glow-sm">
              {getInitials(userName)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-semibold text-ink dark:text-dark-ink group-hover:text-red-600 truncate">
                {userName || "Resume Analyzer"}
              </p>
              <p className="text-[11px] text-muted dark:text-dark-muted group-hover:text-red-500 truncate">
                {userEmail || "AI/ML Portfolio Project"}
              </p>
            </div>
            <ChevronDown size={14} className="text-muted dark:text-dark-muted shrink-0 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
}
