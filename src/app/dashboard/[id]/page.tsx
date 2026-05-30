"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { ResultsPanel } from "@/app/workspace/results-panel";
import { MatchScorePanel } from "@/components/chat/match-score-panel";
import { GenerateResult, MatchScore } from "@/types";

interface SessionDetail {
  id: string;
  title: string;
  candidateName: string;
  adaptedResume: string | null;
  coverLetter: string | null;
  recommendations: string[];
  matchScore: number | null;
  matchStrengths: string[];
  matchGaps: string[];
  resumeTips: string[];
  coverLetterTips: string[];
  createdAt: string;
}

export default function SessionDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && params.id) {
      fetch(`/api/sessions/${params.id}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setSession)
        .catch(() => router.push("/dashboard"))
        .finally(() => setLoading(false));
    }
  }, [status, params.id, router]);

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const result: GenerateResult | null =
    session.adaptedResume || session.coverLetter
      ? {
          adaptedResume: session.adaptedResume || "",
          coverLetter: session.coverLetter || "",
          recommendations: session.recommendations,
        }
      : null;

  const matchData: MatchScore | null =
    session.matchScore !== null
      ? {
          overall: session.matchScore,
          strengths: session.matchStrengths,
          gaps: session.matchGaps,
          resumeTips: session.resumeTips,
          coverLetterTips: session.coverLetterTips,
        }
      : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] transition-colors duration-300">
      <header className="border-b border-gray-100 dark:border-white/[0.04] bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 text-[10px] font-bold">HR</span>
            </div>
            <span className="font-semibold text-[14px] text-gray-900 dark:text-white">Назад</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1.5">
            Сессия
          </p>
          <h1 className="text-[24px] font-semibold text-gray-900 dark:text-white tracking-tight">
            {session.title}
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-gray-500 mt-1">
            {session.candidateName && `${session.candidateName} · `}
            {new Date(session.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className={matchData ? "grid lg:grid-cols-[1fr_320px] gap-6" : ""}>
          {result && (
            <ResultsPanel
              result={result}
              onRegenerate={() => router.push("/workspace")}
              onStartOver={() => router.push("/workspace")}
            />
          )}
          {matchData && (
            <div>
              <MatchScorePanel score={matchData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
