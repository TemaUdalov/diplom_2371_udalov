import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  title: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all duration-500",
                index < currentStep && "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm",
                index === currentStep && "bg-gray-900 dark:bg-white text-white dark:text-gray-900 ring-[3px] ring-gray-900/10 dark:ring-white/10 shadow-sm",
                index > currentStep && "bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-gray-600"
              )}
            >
              {index < currentStep ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
            </div>
            <span
              className={cn(
                "text-[13px] hidden sm:inline transition-all duration-300",
                index <= currentStep ? "text-gray-900 dark:text-white font-medium" : "text-gray-400 dark:text-gray-600"
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-6 sm:w-12 h-px transition-all duration-500",
                index < currentStep ? "bg-gray-900 dark:bg-white/40" : "bg-gray-200 dark:bg-white/[0.06]"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
