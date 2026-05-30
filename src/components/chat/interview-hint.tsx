import { CandidateProfile } from "@/types";
import { getInterviewHint } from "@/services/chat-utils";
import { Lightbulb } from "lucide-react";

interface InterviewHintProps {
  profile: CandidateProfile;
}

export function InterviewHint({ profile }: InterviewHintProps) {
  const hint = getInterviewHint(profile);

  if (!hint) return null;

  return (
    <div className="ml-11 mt-2 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] max-w-[75%]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Lightbulb className="h-3 w-3 text-gray-400 dark:text-gray-600" />
        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-500">
          {hint.title}
        </span>
      </div>
      <ul className="space-y-0.5">
        {hint.tips.map((tip, i) => (
          <li key={i} className="text-[12px] text-gray-400 dark:text-gray-600 flex items-start gap-1.5">
            <span className="text-gray-300 dark:text-gray-700 mt-0.5">·</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
