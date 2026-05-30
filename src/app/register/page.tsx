"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при регистрации");
        return;
      }

      // Auto-login after registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center px-4 relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-violet-200/20 dark:bg-amber-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-5 left-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          На главную
        </Link>
      </div>
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 text-[15px] font-bold">HR</span>
            </div>
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900 dark:text-white tracking-tight">
            Регистрация
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-gray-500 mt-1.5">
            Создайте аккаунт для сохранения результатов
          </p>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px]">
                {error}
              </div>
            )}

            <Input
              id="name"
              label="Имя"
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              type="password"
              label="Пароль"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              id="confirm-password"
              type="password"
              label="Подтверждение пароля"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full">
              Зарегистрироваться
            </Button>
          </form>

          <p className="text-center text-[13px] text-gray-500 dark:text-gray-500 mt-6">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-gray-900 dark:text-white font-medium hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
