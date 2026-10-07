import { useState, useRef, useEffect, type FC } from "react";
import {
  Sparkles,
  Send,
  Maximize2,
  MoreHorizontal,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ChevronDown,
  Bot,
  X,
} from "lucide-react";
import type { AnalysisResult } from "@/types";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What's my ATS score?",
  "Top missing skills?",
  "How to improve my resume?",
  "Explain the match score",
];

const AI_RESPONSES: Record<string, string> = {
  default:
    "Upload a resume to get started! I can help you understand your ATS score, identify skill gaps, and suggest improvements to land more interviews.",
  uploaded:
    "Great! Your resume has been uploaded. Click 'Analyze Resume' to get your ATS score, skill match analysis, and personalized improvement suggestions.",
  analyzed:
    "Your resume has been analyzed! I can see your scores and skill gaps. Ask me anything about the results — I'll help you understand what to improve.",
};

interface AIAssistantPanelProps {
  result: AnalysisResult | null;
  resumeUploaded: boolean;
}

export default function AIAssistantPanel({ result, resumeUploaded }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: AI_RESPONSES.default,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resumeUploaded && !result && messages.length === 1) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: AI_RESPONSES.uploaded,
          timestamp: new Date(),
        },
      ]);
    }
  }, [resumeUploaded]);

  useEffect(() => {
    if (result) {
      const score = result.resume_match_score;
      const ats = result.ats_score.total_score;
      const missing = result.skills.missing_skills.slice(0, 3).join(", ");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: `Analysis complete! 🎉\n\n**Resume Match Score:** ${Math.round(score)}%\n**ATS Score:** ${ats}/${result.ats_score.max_score}\n\n${missing
              ? `**Top missing skills:** ${missing}${result.skills.missing_skills.length > 3 ? ` and ${result.skills.missing_skills.length - 3} more.` : "."}`
              : "Great news — no critical skill gaps detected!"
            }\n\nAsk me anything about your results!`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [result]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function generateResponse(userMsg: string): string {
    const lower = userMsg.toLowerCase();
    if (!result) {
      return "Please upload and analyze your resume first, then I can answer specific questions about your results.";
    }
    if (lower.includes("ats") || lower.includes("score")) {
      return `Your ATS score is **${result.ats_score.total_score}/${result.ats_score.max_score}**.\n\nThe breakdown shows: ${result.ats_score.breakdown
        .map((b) => `${b.category}: ${b.score}/${b.max_score}`)
        .join(", ")}.`;
    }
    if (lower.includes("missing") || lower.includes("skill")) {
      const missing = result.skills.missing_skills;
      if (missing.length === 0) return "Excellent! No missing skills detected. Your resume covers all required skills from the job description.";
      return `You're missing **${missing.length} skills**: ${missing.join(", ")}.\n\nConsider adding these to your resume or gaining experience in them.`;
    }
    if (lower.includes("match") || lower.includes("similarity")) {
      return `Your resume match score is **${Math.round(result.resume_match_score)}%**. This is calculated using TF-IDF cosine similarity between your resume and the job description.`;
    }
    if (lower.includes("improve") || lower.includes("suggestion") || lower.includes("tip")) {
      const top = result.suggestions[0];
      if (!top) return "Your resume looks great! No critical improvements needed.";
      return `Top suggestion (**${top.severity} priority**):\n\n**${top.category}:** ${top.suggestion}`;
    }
    return `Based on your analysis:\n- Match Score: **${Math.round(result.resume_match_score)}%**\n- ATS Score: **${result.ats_score.total_score}/${result.ats_score.max_score}**\n- Skills Found: **${result.skills.resume_skill_count}**\n\nFeel free to ask more specific questions!`;
  }

  async function handleSend() {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    setIsTyping(false);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: generateResponse(msg),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function renderContent(text: string) {
    // Simple markdown-like bold rendering
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <aside className="hidden xl:flex flex-col w-[340px] shrink-0 border-l border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card h-screen sticky top-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 dark:border-dark-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-grad-primary flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-semibold text-[14px] text-ink dark:text-dark-ink">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-slate-100 transition-colors">
            <Maximize2 size={14} />
          </button>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-slate-100 transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-grad-primary flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={13} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
              <div
                className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-ai text-muted"
                  }`}
              >
                {renderContent(msg.content)}
              </div>
              {msg.role === "ai" && (
                <div className="flex items-center gap-1 mt-1.5 ml-1">
                  <button className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:bg-slate-100 transition-colors">
                    <Copy size={11} />
                  </button>
                  <button className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:bg-slate-100 transition-colors">
                    <ThumbsUp size={11} />
                  </button>
                  <button className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:bg-slate-100 transition-colors">
                    <ThumbsDown size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-grad-primary flex items-center justify-center shrink-0">
              <Bot size={13} className="text-white" />
            </div>
            <div className="chat-bubble-ai px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sources */}
      {result && (
        <div className="mx-4 mb-3 border border-slate-100 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-3 py-2.5 text-[12px] font-medium text-muted hover:bg-slate-50 transition-colors"
            onClick={() => setSourcesOpen((o) => !o)}
          >
            <span>Sources ({2})</span>
            <ChevronDown size={13} className={`transition-transform ${sourcesOpen ? "rotate-180" : ""}`} />
          </button>
          {sourcesOpen && (
            <div className="border-t border-slate-100 divide-y divide-slate-50">
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-5 h-5 rounded file-pdf flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-white">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-ink truncate">Resume.pdf</p>
                  <p className="text-[10px] text-muted">Uploaded</p>
                </div>
              </div>
              {result.skills.jd_skill_count > 0 && (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <div className="w-5 h-5 rounded file-docx flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-white">JD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-ink truncate">Job Description</p>
                    <p className="text-[10px] text-muted">Uploaded</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Suggested questions */}
      <div className="px-4 mb-3">
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => {
                setInput(q);
                handleSend();
              }}
              className="text-[11px] font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0 border-t border-slate-100 pt-3">
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your resume..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-[13px] text-ink placeholder:text-muted focus:outline-none py-1 px-1 leading-relaxed max-h-28"
            style={{ minHeight: "36px" }}
          />
          <div className="flex items-center gap-1 shrink-0">
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-slate-200 transition-colors">
              <Paperclip size={14} />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-grad-primary text-white shadow-lift disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <button className="text-[11px] text-muted hover:text-ink flex items-center gap-1 transition-colors">
            <Paperclip size={11} /> Attach
          </button>
          <button className="text-[11px] text-muted hover:text-ink flex items-center gap-1 transition-colors">
            <Sparkles size={11} /> Select Sources ({result ? (result.skills.jd_skill_count > 0 ? 2 : 1) : 0})
          </button>
        </div>
      </div>
    </aside>
  );
}
