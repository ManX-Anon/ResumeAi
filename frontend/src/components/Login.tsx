import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles } from "lucide-react";

interface LoginProps {
  onLogin: (email: string, name: string) => void;
}

function extractNameFromEmail(email: string) {
  const localPart = email.split("@")[0];
  const parts = localPart.split(/[._-]/);
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    const name = extractNameFromEmail(email);
    onLogin(email, name);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-dark-surface p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-grad-primary shadow-glow-primary mb-5 relative group">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-ink dark:text-dark-ink mb-2">
            Welcome to Resume Analyzer
          </h1>
          <p className="text-[14px] text-muted dark:text-dark-muted">
            Sign in with your email to access your dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-dark-border"
        >
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-ink dark:text-dark-ink mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="john.doe@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800/50 text-sm text-ink dark:text-dark-ink focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            {error && (
              <p className="mt-2 text-[12px] text-red-500 font-medium">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-ink py-3 rounded-xl text-sm font-semibold transition-all group"
          >
            Continue
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
