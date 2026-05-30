"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidateProfile } from "@/types";

interface ResumeModalProps {
  profile: CandidateProfile;
  onClose: () => void;
}

export function ResumeModal({ profile, onClose }: ResumeModalProps) {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchResume = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResumeText(data.text);
    } catch {
      setError("Не удалось сгенерировать резюме");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchResume(); }, []);

  const handleCopy = async () => {
    if (!resumeText) return;
    await navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!resumeText) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 7;
    let y = margin;

    const lines = resumeText.split("\n");

    for (const line of lines) {
      const isHeader = line === line.toUpperCase() && line.trim().length > 0;

      if (isHeader) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
      }

      const splitLines = doc.splitTextToSize(line || " ", maxWidth);

      for (const splitLine of splitLines) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(splitLine, margin, y);
        y += lineHeight;
      }
    }

    doc.save("resume.pdf");
  };

  return (
    <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#141418] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/[0.06] w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-600" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Резюме
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
              <p className="text-[13px] text-gray-500 dark:text-gray-500">Генерация резюме...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[13px]">
              {error}
            </div>
          )}

          {resumeText && (
            <pre className="whitespace-pre-wrap text-[13px] text-gray-800 dark:text-gray-200 font-sans leading-relaxed bg-gray-50 dark:bg-white/[0.02] rounded-xl p-5 border border-gray-100 dark:border-white/[0.04]">
              {resumeText}
            </pre>
          )}
        </div>

        {/* Footer */}
        {resumeText && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.04] flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5 mr-1.5" /> Скопировано
                </span>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Скопировать
                </>
              )}
            </Button>
            <Button size="sm" onClick={handleDownloadPDF}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Скачать PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
