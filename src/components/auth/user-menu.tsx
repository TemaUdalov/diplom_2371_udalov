"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-[13px] font-medium text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5"
      >
        Войти
      </Link>
    );
  }

  const initials = (session.user.name || session.user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-[12px] font-semibold text-white dark:text-gray-900">
          {initials}
        </div>
        <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {session.user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#18181f] shadow-xl dark:shadow-2xl z-50 py-1 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.04]">
            <p className="text-[13px] font-medium text-gray-900 dark:text-white">{session.user.name}</p>
            <p className="text-[12px] text-gray-500 dark:text-gray-500 truncate">{session.user.email}</p>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-gray-400 dark:text-gray-600" />
            Личный кабинет
          </Link>

          <button
            onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors w-full text-left"
          >
            <LogOut className="h-4 w-4 text-gray-400 dark:text-gray-600" />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
