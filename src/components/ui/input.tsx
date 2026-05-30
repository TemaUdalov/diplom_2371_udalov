import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "block w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all duration-200 focus:border-gray-400 dark:focus:border-white/20 focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-white/[0.06] focus:outline-none",
          error && "border-red-400 dark:border-red-500/40 focus:border-red-400 focus:ring-red-200/50",
          className
        )}
        {...props}
      />
      {error && <p className="text-[13px] text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
export { Input };
