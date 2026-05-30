"use client";

import { RefreshCw, RotateCcw, FileText, Mail, Lightbulb, CheckCircle2, Save, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { GenerateResult } from "@/types";
import { useState } from "react";

type Tab = "resume" | "cover" | "recommendations";

interface ResultsPanelProps {
  result: GenerateResult;
  onRegenerate: () => void;
  onStartOver: () => void;
  onSave?: () => void;
  saved?: boolean;
  isAuthenticated?: boolean;
}

export function ResultsPanel({ result, onRegenerate, onStartOver, onSave, saved, isAuthenticated }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("resume");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "resume", label: "Резюме", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "cover", label: "Письмо", icon: <Mail className="h-3.5 w-3.5" /> },
    { id: "recommendations", label: "Советы", icon: <Lightbulb className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200/60 dark:border-emerald-500/10">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <p className="text-[13px] text-emerald-700 dark:text-emerald-400 font-medium">
          Результат готов! Переключайтесь между вкладками ниже.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resume */}
      {activeTab === "resume" && (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.04]">
            <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Адаптированное резюме
            </span>
            <CopyButton text={result.adaptedResume} />
          </div>
          <div className="p-5">
            <pre className="whitespace-pre-wrap text-[13px] text-gray-800 dark:text-gray-200 font-sans leading-relaxed bg-gray-50 dark:bg-white/[0.02] rounded-xl p-5 border border-gray-100 dark:border-white/[0.04]">
              {result.adaptedResume}
            </pre>
          </div>
        </div>
      )}

      {/* Cover Letter */}
      {activeTab === "cover" && (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.04]">
            <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Сопроводительное письмо
            </span>
            <CopyButton text={result.coverLetter} />
          </div>
          <div className="p-5">
            <pre className="whitespace-pre-wrap text-[13px] text-gray-800 dark:text-gray-200 font-sans leading-relaxed bg-gray-50 dark:bg-white/[0.02] rounded-xl p-5 border border-gray-100 dark:border-white/[0.04]">
              {result.coverLetter}
            </pre>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {activeTab === "recommendations" && (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.04]">
            <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Рекомендации по улучшению
            </span>
          </div>
          <div className="p-5">
            <ul className="space-y-4">
              {(Array.isArray(result.recommendations) ? result.recommendations : [result.recommendations].filter(Boolean)).map((rec, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 flex items-center justify-center text-[11px] font-bold tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">{rec}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Save / Auth prompt */}
      {onSave && isAuthenticated && !saved && (
        <div className="flex justify-center">
          <Button onClick={onSave}>
            <Save className="mr-2 h-4 w-4" /> Сохранить в кабинет
          </Button>
        </div>
      )}
      {saved && (
        <div className="flex items-center justify-center gap-2 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Сохранено!{" "}
          <Link href="/dashboard" className="underline hover:no-underline">
            Открыть кабинет
          </Link>
        </div>
      )}
      {onSave && !isAuthenticated && (
        <div className="text-center p-4 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
          <p className="text-[13px] text-gray-500 dark:text-gray-500 mb-3">
            Войдите, чтобы сохранить результат в личный кабинет
          </p>
          <Link href="/login">
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" /> Войти
            </Button>
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-2">
        <Button variant="outline" onClick={onRegenerate}>
          <RefreshCw className="mr-2 h-4 w-4" /> Заново
        </Button>
        <Button variant="secondary" onClick={onStartOver}>
          <RotateCcw className="mr-2 h-4 w-4" /> Сначала
        </Button>
      </div>
    </div>
  );
}
