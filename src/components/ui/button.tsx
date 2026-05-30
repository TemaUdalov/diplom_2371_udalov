import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          {
            "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98]":
              variant === "primary",
            "bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl active:scale-[0.98]":
              variant === "secondary",
            "border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-gray-400 dark:hover:border-white/20 rounded-xl active:scale-[0.98]":
              variant === "outline",
            "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/[0.06] rounded-lg":
              variant === "ghost",
          },
          {
            "px-3 py-1.5 text-[13px] gap-1.5": size === "sm",
            "px-5 py-2.5 text-sm gap-2": size === "md",
            "px-7 py-3 text-base gap-2.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
