import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import Login from "@/components/Login";
import type { AnalysisResult } from "@/types";

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("userEmail"));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem("userName"));
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  function handleNavigate(id: string) {
    setActiveSection(id);
    setSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleLogin(email: string, name: string) {
    setUserEmail(email);
    setUserName(name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);
  }

  function handleLogout() {
    setUserEmail(null);
    setUserName(null);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
  }

  if (!userEmail) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-surface dark:bg-dark-surface">
      {/* Left Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        open={sidebarOpen}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Dashboard
            userName={userName}
            onResult={(r) => setResult(r)}
            onResumeUploaded={() => setResumeUploaded(true)}
          />
        </main>
      </div>

      {/* Right AI Assistant Panel */}
      <AIAssistantPanel result={result} resumeUploaded={resumeUploaded} />
    </div>
  );
}
