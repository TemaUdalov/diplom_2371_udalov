"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Target,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";

interface SessionItem {
  id: string;
  title: string;
  candidateName: string;
  matchScore: number | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSessions();
    }
  }, [status]);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить эту сессию?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  if (status === "loading" || (status === "unauthenticated")) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-white/[0.04] bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 text-[10px] font-bold">HR</span>
            </div>
            <span className="font-semibold text-[14px] text-gray-900 dark:text-white">HR-ассистент</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Title */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1.5">
              Личный кабинет
            </p>
            <h1 className="text-[26px] font-semibold text-gray-900 dark:text-white tracking-tight">
              Мои сессии
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-500 mt-1">
              {session?.user?.name} &middot; {session?.user?.email}
            </p>
          </div>
          <Link href="/workspace">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Новая сессия
            </Button>
          </Link>
        </div>

        {/* Sessions list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
              <FolderOpen className="h-6 w-6 text-gray-300 dark:text-gray-700" />
            </div>
            <h3 className="text-[15px] font-medium text-gray-900 dark:text-white mb-1.5">
              Пока нет сохранённых сессий
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-500 mb-6">
              Создайте первую сессию — адаптируйте резюме под вакансию
            </p>
            <Link href="/workspace">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Создать первую сессию
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/${s.id}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {s.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-400 dark:text-gray-600">
                    {s.candidateName && (
                      <span>{s.candidateName}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(s.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {s.matchScore !== null && (
                    <span className={`flex items-center gap-1 text-[13px] font-bold tabular-nums ${getScoreColor(s.matchScore)}`}>
                      <Target className="h-3.5 w-3.5" />
                      {s.matchScore}%
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(s.id); }}
                    disabled={deleting === s.id}
                    className="p-2 rounded-lg text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    {deleting === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
