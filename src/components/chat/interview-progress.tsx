import { CandidateProfile } from "@/types";
import { getProfileProgress } from "@/services/chat-utils";
import { Check } from "lucide-react";

interface InterviewProgressProps {
  profile: CandidateProfile;
}

export function InterviewProgress({ profile }: InterviewProgressProps) {
  const { filled, total, percent } = getProfileProgress(profile);

  return (
    <div className="px-6 py-3 border-b border-gray-100 dark:border-white/[0.04]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
          {percent === 100 ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
              Профиль заполнен
            </>
          ) : (
            <>Прогресс: {filled} / {total}</>
          )}
        </span>
        <span className="text-[12px] font-semibold text-gray-900 dark:text-white tabular-nums">
          {percent}%
        </span>
      </div>
      <div className="w-full h-1 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            percent === 100
              ? "bg-emerald-500"
              : "bg-gray-900 dark:bg-white/60"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
