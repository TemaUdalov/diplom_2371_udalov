import Link from "next/link";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
  Brain,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  let sessionsCount = 0;
  let usersCount = 0;

  try {
    [sessionsCount, usersCount] = await Promise.all([
      prisma.generationSession.count(),
      prisma.user.count(),
    ]);
  } catch {
    // DB unavailable — show zeros
  }
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
          <div className="glass-strong rounded-2xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white dark:text-gray-900" />
              </div>
              <span className="font-semibold text-[15px] text-gray-900 dark:text-white tracking-tight">
                HR-ассистент
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
              <Link href="/workspace">
                <Button size="sm">
                  Начать <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle ambient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-200/20 dark:bg-white/[0.02] blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center pt-32 pb-24">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 text-[13px] font-medium mb-10 border border-gray-200/60 dark:border-white/[0.06]">
              <Brain className="h-3.5 w-3.5" />
              AI-ассистент для карьеры
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8 animate-slide-up">
            <span className="text-gray-900 dark:text-white">Ваш отклик.</span>
            <br />
            <span className="text-gradient">Без компромиссов.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-500 max-w-xl mx-auto mb-12 leading-relaxed animate-slide-up-delayed font-light">
            AI проведёт интервью, соберёт ваш профиль
            и создаст отклик, который работает
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delayed-2">
            <Link href="/workspace">
              <Button size="lg" className="text-[15px] px-8 shadow-lg shadow-gray-900/10 dark:shadow-black/30 hover:-translate-y-0.5 transition-all duration-300">
                Начать бесплатно <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <span className="text-[13px] text-gray-400 dark:text-gray-600">Без регистрации</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in [animation-delay:1s]">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <p className="text-[13px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4">
              Возможности
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Три инструмента. Один результат.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              number="01"
              title="Адаптация резюме"
              description="Автоматическая адаптация под требования вакансии с использованием ключевых слов и акцентом на релевантный опыт"
            />
            <FeatureCard
              icon={<MessageSquare className="h-5 w-5" />}
              number="02"
              title="Cover Letter"
              description="Персонализированное сопроводительное письмо от вашего лица, которое подчёркивает сильные стороны"
            />
            <FeatureCard
              icon={<Target className="h-5 w-5" />}
              number="03"
              title="Оценка и советы"
              description="Детальный анализ соответствия вакансии с конкретными рекомендациями по улучшению отклика"
            />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="relative py-32 border-t border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <p className="text-[13px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4">
              Процесс
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              От вакансии до отклика за 5 минут
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { step: "01", title: "Вставьте вакансию", desc: "Скопируйте текст вакансии из любого источника", icon: <FileText className="h-5 w-5" /> },
              { step: "02", title: "Пройдите интервью", desc: "AI-ассистент задаст вопросы и соберёт ваш профиль", icon: <MessageSquare className="h-5 w-5" /> },
              { step: "03", title: "Получите результат", desc: "Резюме, письмо, оценка соответствия и советы", icon: <Zap className="h-5 w-5" /> },
            ].map((item) => (
              <div key={item.step} className="group flex items-start gap-6 p-6 rounded-2xl border border-transparent hover:border-gray-200/80 dark:hover:border-white/[0.06] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-300">
                <span className="text-[13px] font-mono font-medium text-gray-300 dark:text-gray-700 pt-1 flex-shrink-0 w-8">
                  {item.step}
                </span>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center text-gray-500 dark:text-gray-500 group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 transition-all duration-300">
                  {item.icon}
                </div>
                <div className="pt-0.5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 border-t border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { value: "< 30с", label: "анализ вакансии" },
              { value: "100%", label: "бесплатно" },
              { value: String(sessionsCount), label: "резюме сгенерировано" },
              { value: String(usersCount), label: "пользователей доверяют нам" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[13px] text-gray-400 dark:text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gray-950 dark:bg-white/[0.03] p-12 sm:p-20 text-center border border-gray-800 dark:border-white/[0.06]">
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Готовы попробовать?
              </h2>
              <p className="text-gray-400 mb-10 max-w-md mx-auto text-[15px]">
                Загрузите вакансию и получите профессиональный отклик за несколько минут
              </p>
              <Link href="/workspace">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 shadow-2xl shadow-white/10 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Начать сейчас <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-white/[0.04] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white dark:text-gray-900" />
            </div>
            <span className="text-[13px] font-medium text-gray-500 dark:text-gray-500">HR-ассистент</span>
          </div>
          <p className="text-[13px] text-gray-400 dark:text-gray-700">
            &copy; {new Date().getFullYear()} Дипломный проект
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  number,
  title,
  description,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-6 sm:p-8 rounded-2xl border border-gray-200/60 dark:border-white/[0.04] bg-white dark:bg-white/[0.01] hover:border-gray-300 dark:hover:border-white/[0.08] transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-none hover:-translate-y-1">
      <div className="flex items-start justify-between mb-6">
        <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 transition-all duration-300">
          {icon}
        </div>
        <span className="text-[13px] font-mono text-gray-300 dark:text-gray-700">{number}</span>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2.5 text-lg tracking-tight">{title}</h3>
      <p className="text-gray-500 dark:text-gray-500 text-[14px] leading-relaxed">{description}</p>
    </div>
  );
}
