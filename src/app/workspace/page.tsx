"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  RotateCcw,
  MessageSquare,
  ClipboardList,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Steps } from "@/components/ui/steps";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { QuickActions } from "@/components/chat/quick-actions";
import { ProfileSummary } from "@/components/chat/profile-summary";
import { MatchScorePanel } from "@/components/chat/match-score-panel";
import { InterviewProgress } from "@/components/chat/interview-progress";
import { InterviewHint } from "@/components/chat/interview-hint";
import { ResumeModal } from "@/components/chat/resume-modal";
import { ResultsPanel } from "./results-panel";
import {
  CandidateData,
  ChatMessage,
  CandidateProfile,
  MatchScore,
  GenerateResult,
  emptyCandidateProfile,
  AnsweredQuestion,
} from "@/types";
import { getGreeting, profileToCandidateData } from "@/services/chat-utils";

const STEPS = [
  { title: "Вакансия" },
  { title: "Режим" },
  { title: "Интервью" },
  { title: "Результат" },
];

type Mode = "interview" | "form";

const emptyCandidateData: CandidateData = {
  name: "",
  desiredPosition: "",
  experience: "",
  skills: "",
  education: "",
  achievements: "",
  currentResume: "",
};

export default function WorkspacePage() {
  const { data: authSession } = useSession();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [saved, setSaved] = useState(false);

  // Form mode state
  const [candidate, setCandidate] = useState<CandidateData>(emptyCandidateData);
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Interview mode state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<CandidateProfile>(emptyCandidateProfile);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [typing, setTyping] = useState(false);
  const [candidateName, setCandidateName] = useState("");

  // Shared state
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  // ----- Interview mode handlers -----

  const startInterview = () => {
    setMode("interview");
    setStep(2);
    const greeting = getGreeting(jobDescription);
    const greetingMsg: ChatMessage = {
      id: "greeting",
      role: "assistant",
      content: greeting,
      timestamp: Date.now(),
    };
    setMessages([greetingMsg]);
  };

  const sendToChat = async (msgs: ChatMessage[], currentProfile: CandidateProfile) => {
    setTyping(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs,
          jobDescription,
          profile: currentProfile,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setProfile(data.updatedProfile);
      setInterviewComplete(data.interviewComplete);
    } catch {
      setError("Ошибка при получении ответа. Попробуйте снова.");
    } finally {
      setTyping(false);
    }
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    sendToChat(newMessages, profile);
  };

  const handleQuickAction = (text: string) => {
    handleSendMessage(text);
  };

  // ----- Generate result (from interview) -----

  const handleGenerateFromInterview = async () => {
    setLoading(true);
    setError("");
    try {
      const candidateData = profileToCandidateData(profile, candidateName || "Кандидат");
      const answeredQuestions: AnsweredQuestion[] = messages
        .filter((m) => m.role === "user")
        .map((m, i) => ({ id: `a-${i}`, question: "", answer: m.content }));

      const [genRes, assessRes] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDescription,
            candidate: candidateData,
            answers: answeredQuestions,
            profile,
          }),
        }),
        fetch("/api/assess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription, profile, messages }),
        }),
      ]);

      if (!genRes.ok) throw new Error();
      const genData: GenerateResult = await genRes.json();
      setResult(genData);

      if (assessRes.ok) {
        const assessData: MatchScore = await assessRes.json();
        setMatchScore(assessData);
      }

      setStep(3);
    } catch {
      setError("Ошибка при генерации результата.");
    } finally {
      setLoading(false);
    }
  };

  // ----- Form mode handlers -----

  const updateCandidate = (field: keyof CandidateData, value: string) => {
    setCandidate((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, candidate }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFormAnswers({});
      setFormSubmitted(true);
      setMessages(
        data.questions.map((q: { id: string; question: string }) => ({
          id: q.id,
          role: "assistant" as const,
          content: q.question,
          timestamp: Date.now(),
        }))
      );
      setStep(2);
    } catch {
      setError("Не удалось проанализировать данные.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const answeredQuestions: AnsweredQuestion[] = messages.map((m) => ({
        id: m.id,
        question: m.content,
        answer: formAnswers[m.id] || "",
      }));

      const formProfile: CandidateProfile = {
        desiredPosition: candidate.desiredPosition,
        level: "",
        experience: candidate.experience,
        skills: candidate.skills ? candidate.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        achievements: candidate.achievements ? [candidate.achievements] : [],
        education: candidate.education,
        strengths: [],
        weaknesses: [],
        careerGoals: "",
        motivation: "",
        relevance: "",
      };

      const [genRes, assessRes] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription, candidate, answers: answeredQuestions }),
        }),
        fetch("/api/assess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription, profile: formProfile, messages: [] }),
        }),
      ]);

      if (!genRes.ok) throw new Error();
      const genData: GenerateResult = await genRes.json();
      setResult(genData);

      if (assessRes.ok) {
        const assessData: MatchScore = await assessRes.json();
        setMatchScore(assessData);
      }

      setStep(3);
    } catch {
      setError("Ошибка генерации.");
    } finally {
      setLoading(false);
    }
  };

  // ----- Reset -----

  const handleStartOver = () => {
    setStep(0);
    setMode(null);
    setJobDescription("");
    setCandidate(emptyCandidateData);
    setFormAnswers({});
    setFormSubmitted(false);
    setMessages([]);
    setProfile(emptyCandidateProfile);
    setInterviewComplete(false);
    setMatchScore(null);
    setResult(null);
    setError("");
    setCandidateName("");
  };

  const handleSave = async () => {
    if (!authSession?.user || !result) return;
    setLoading(true);
    try {
      const title = profile.desiredPosition
        || candidate.desiredPosition
        || jobDescription.slice(0, 60)
        || "Сессия";
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          jobDescription,
          candidateName: candidateName || candidate.name || "",
          adaptedResume: result.adaptedResume,
          coverLetter: result.coverLetter,
          recommendations: result.recommendations,
          matchScore: matchScore?.overall ?? null,
          matchStrengths: matchScore?.strengths ?? [],
          matchGaps: matchScore?.gaps ?? [],
          resumeTips: matchScore?.resumeTips ?? [],
          coverLetterTips: matchScore?.coverLetterTips ?? [],
          profileData: profile.desiredPosition ? profile : null,
          chatMessages: mode === "interview"
            ? messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp }))
            : [],
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      setError("Не удалось сохранить");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setResult(null);
    setSaved(false);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-white/[0.04] bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 text-[10px] font-bold">HR</span>
            </div>
            <span className="font-semibold text-[14px] text-gray-900 dark:text-white">HR-ассистент</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
            <Button variant="ghost" size="sm" onClick={handleStartOver}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Сначала
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Steps steps={STEPS} currentStep={step} />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px] animate-fade-in">
            {error}
          </div>
        )}

        {/* ========== Step 0: Job description ========== */}
        {step === 0 && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                Шаг 1
              </p>
              <h2 className="text-[22px] font-semibold text-gray-900 dark:text-white tracking-tight mb-1.5">
                Описание вакансии
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-500">
                Вставьте текст вакансии для анализа
              </p>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 space-y-5">
              <Textarea
                id="job"
                label="Текст вакансии"
                placeholder="Скопируйте и вставьте полное описание вакансии, на которую хотите откликнуться..."
                rows={10}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={() => setStep(1)} disabled={!jobDescription.trim()}>
                  Далее <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========== Step 1: Choose mode ========== */}
        {step === 1 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                Шаг 2
              </p>
              <h2 className="text-[22px] font-semibold text-gray-900 dark:text-white tracking-tight mb-1.5">
                Как вы хотите заполнить данные?
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-500">
                Выберите удобный формат — интервью с AI или классическую форму
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Interview mode */}
              <button
                onClick={() => {
                  setMode("interview");
                  startInterview();
                }}
                className="group relative p-6 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-gray-400 dark:hover:border-white/[0.12] transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-none hover:-translate-y-0.5 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-5 w-5 text-white dark:text-gray-900" />
                </div>
                <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-1.5">
                  AI-интервью
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-gray-500 leading-relaxed">
                  ИИ задаст вопросы в формате диалога, соберёт ваш профиль и оценит
                  соответствие вакансии
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                  Рекомендуется
                </span>
              </button>

              {/* Form mode */}
              <button
                onClick={() => {
                  setMode("form");
                  setStep(2);
                }}
                className="group relative p-6 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-gray-400 dark:hover:border-white/[0.12] transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-none hover:-translate-y-0.5 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ClipboardList className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-1.5">
                  Классическая форма
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-gray-500 leading-relaxed">
                  Заполните поля вручную — имя, опыт, навыки, образование, достижения
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-600">
                  Быстрый вариант
                </span>
              </button>
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
              </Button>
            </div>
          </div>
        )}

        {/* ========== Step 2: Interview mode ========== */}
        {step === 2 && mode === "interview" && (
          <div className="animate-fade-in">
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              {/* Chat column */}
              <div className="flex flex-col">
                <div className="flex-1 flex flex-col min-h-[500px] max-h-[70vh] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
                  <div className="flex-shrink-0 px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                      <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600">
                        AI-интервью
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <InterviewProgress profile={profile} />
                  <div className="flex-1 overflow-y-auto space-y-4 px-5 py-4 scroll-smooth">
                    {messages.length <= 1 && !typing && (
                      <div className="mb-4">
                        <QuickActions onSelect={handleQuickAction} />
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <div key={msg.id}>
                        <ChatBubble message={msg} />
                        {msg.role === "assistant" &&
                          idx === messages.length - 1 &&
                          !typing &&
                          !interviewComplete && (
                            <InterviewHint profile={profile} />
                          )}
                      </div>
                    ))}
                    {typing && <TypingIndicator />}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="px-5 py-3.5 border-t border-gray-100 dark:border-white/[0.04]">
                    <ChatInput
                      onSend={handleSendMessage}
                      disabled={typing}
                      placeholder={interviewComplete ? "Интервью завершено" : "Напишите ответ..."}
                    />
                  </div>
                </div>

                {/* Name input + action buttons after interview */}
                {interviewComplete && (
                  <div className="mt-4 space-y-3 animate-slide-up">
                    <Input
                      id="candidate-name"
                      label="Ваше ФИО (для резюме)"
                      placeholder="Иванов Иван Иванович"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleGenerateFromInterview} loading={loading}>
                        <Sparkles className="mr-2 h-4 w-4" /> Получить результат
                      </Button>
                      <Button variant="outline" onClick={() => setShowResumeModal(true)}>
                        <FileText className="mr-2 h-4 w-4" /> Получить резюме
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4 hidden lg:block">
                <ProfileSummary profile={profile} />
                {matchScore && <MatchScorePanel score={matchScore} />}
              </div>
            </div>

            {/* Mobile profile & score */}
            <div className="mt-6 space-y-4 lg:hidden">
              <ProfileSummary profile={profile} />
              {matchScore && <MatchScorePanel score={matchScore} />}
            </div>
          </div>
        )}

        {/* ========== Step 2: Form mode ========== */}
        {step === 2 && mode === "form" && !formSubmitted && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                Данные
              </p>
              <h2 className="text-[22px] font-semibold text-gray-900 dark:text-white tracking-tight">
                Данные о кандидате
              </h2>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  id="name"
                  label="ФИО"
                  placeholder="Иванов Иван Иванович"
                  value={candidate.name}
                  onChange={(e) => updateCandidate("name", e.target.value)}
                />
                <Input
                  id="position"
                  label="Желаемая должность"
                  placeholder="Frontend-разработчик"
                  value={candidate.desiredPosition}
                  onChange={(e) => updateCandidate("desiredPosition", e.target.value)}
                />
              </div>
              <Textarea
                id="experience"
                label="Опыт работы"
                placeholder="Компании, должности, обязанности..."
                rows={4}
                value={candidate.experience}
                onChange={(e) => updateCandidate("experience", e.target.value)}
              />
              <Textarea
                id="skills"
                label="Навыки"
                placeholder="Ключевые навыки через запятую..."
                rows={3}
                value={candidate.skills}
                onChange={(e) => updateCandidate("skills", e.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Textarea
                  id="education"
                  label="Образование"
                  placeholder="ВУЗ, специальность..."
                  rows={3}
                  value={candidate.education}
                  onChange={(e) => updateCandidate("education", e.target.value)}
                />
                <Textarea
                  id="achievements"
                  label="Достижения"
                  placeholder="Награды, сертификаты..."
                  rows={3}
                  value={candidate.achievements}
                  onChange={(e) => updateCandidate("achievements", e.target.value)}
                />
              </div>
              <Textarea
                id="resume"
                label="Текущее резюме (необязательно)"
                placeholder="Вставьте текст целиком..."
                rows={5}
                value={candidate.currentResume}
                onChange={(e) => updateCandidate("currentResume", e.target.value)}
              />
              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
                <Button
                  onClick={handleFormAnalyze}
                  loading={loading}
                  disabled={!candidate.name.trim() || !candidate.desiredPosition.trim()}
                >
                  Анализировать <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Form mode: clarifying questions */}
        {step === 2 && mode === "form" && formSubmitted && messages.length > 0 && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                Уточнение
              </p>
              <h2 className="text-[22px] font-semibold text-gray-900 dark:text-white tracking-tight mb-1.5">
                Уточняющие вопросы
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-500">
                Ответьте на вопросы для более точного результата. Можно пропустить.
              </p>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 space-y-6">
              {messages.map((q, idx) => (
                <Textarea
                  key={q.id}
                  id={q.id}
                  label={`${idx + 1}. ${q.content}`}
                  placeholder="Ваш ответ..."
                  rows={3}
                  value={formAnswers[q.id] || ""}
                  onChange={(e) =>
                    setFormAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              ))}
              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={() => { setFormSubmitted(false); }}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
                <Button onClick={handleFormGenerate} loading={loading}>
                  Сгенерировать <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========== Step 3: Results ========== */}
        {step === 3 && result && (
          <div className="animate-fade-in space-y-6">
            {matchScore && (
              <div className="lg:hidden">
                <MatchScorePanel score={matchScore} />
              </div>
            )}
            <div className={matchScore ? "grid lg:grid-cols-[1fr_320px] gap-6" : ""}>
              <ResultsPanel
                result={result}
                onRegenerate={handleRegenerate}
                onStartOver={handleStartOver}
                onSave={handleSave}
                saved={saved}
                isAuthenticated={!!authSession?.user}
              />
              {matchScore && (
                <div className="hidden lg:block">
                  <MatchScorePanel score={matchScore} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resume modal */}
        {showResumeModal && (
          <ResumeModal
            profile={profile}
            onClose={() => setShowResumeModal(false)}
          />
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#141418] rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-white/[0.06] flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white dark:text-gray-900 animate-spin" />
              </div>
              <p className="text-[14px] text-gray-900 dark:text-white font-medium">Обработка...</p>
              <p className="text-[12px] text-gray-400 dark:text-gray-600">
                Это займёт несколько секунд
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
