import { useCallback, useRef, useState } from "react";
import type React from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileCheck2, X, Loader2, File } from "lucide-react";

interface UploadCardProps {
  title: string;
  description: string;
  accept?: string;
  allowPasteText?: boolean;
  onFileSelected?: (file: File) => void;
  onTextChange?: (text: string) => void;
  status: "idle" | "uploading" | "done" | "error";
  fileName?: string | null;
  errorMessage?: string | null;
}

export default function UploadCard({
  title,
  description,
  accept = ".pdf,.docx",
  allowPasteText = false,
  onFileSelected,
  onTextChange,
  status,
  fileName,
  errorMessage,
}: UploadCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<"file" | "text">("file");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && onFileSelected) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-soft p-5">
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-ink dark:text-dark-ink text-[14px]">{title}</h3>
          <p className="text-[12px] text-muted dark:text-dark-muted mt-0.5">{description}</p>
        </div>
        {allowPasteText && (
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-[11px] font-medium shrink-0">
            <button
              onClick={() => setMode("file")}
              className={`px-2.5 py-1 rounded-md transition-colors ${mode === "file" ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
                }`}
            >
              Upload
            </button>
            <button
              onClick={() => setMode("text")}
              className={`px-2.5 py-1 rounded-md transition-colors ${mode === "text" ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
                }`}
            >
              Paste
            </button>
          </div>
        )}
      </div>

      {mode === "text" && allowPasteText ? (
        <textarea
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-36 resize-none rounded-xl border border-slate-200 p-3 text-sm text-ink focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
        />
      ) : (
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => status !== "uploading" && inputRef.current?.click()}
          whileHover={status !== "uploading" ? { y: -2 } : {}}
          className={`relative flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200
            ${dragOver
              ? "border-primary-400 bg-primary-50/50"
              : status === "done"
                ? "border-emerald-300 bg-emerald-50/30 cursor-default"
                : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFileSelected) onFileSelected(file);
            }}
          />

          {status === "uploading" ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={22} />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-ink">Extracting text…</p>
                <p className="text-[11px] text-muted mt-0.5">Please wait</p>
              </div>
            </>
          ) : status === "done" ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileCheck2 className="text-emerald-500" size={22} />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-ink">{fileName}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Processed successfully ✓</p>
              </div>
            </>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragOver ? "bg-primary-100" : "bg-slate-100"
                }`}>
                <UploadCloud className={dragOver ? "text-primary-500" : "text-muted"} size={22} />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-ink">
                  Drop your file here, or <span className="text-primary-500">browse</span>
                </p>
                <p className="text-[11px] text-muted mt-0.5">PDF and DOCX supported, up to 8MB</p>
              </div>
            </>
          )}

          {status === "error" && (
            <div className="flex items-center gap-1.5 text-[12px] text-danger bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 mt-1">
              <X size={13} /> {errorMessage || "Upload failed. Try again."}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
