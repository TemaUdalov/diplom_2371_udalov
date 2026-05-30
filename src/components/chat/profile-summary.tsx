import { CandidateProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, GraduationCap, Star, Target, TrendingUp } from "lucide-react";

interface ProfileSummaryProps {
  profile: CandidateProfile;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const sections = [
    { icon: Briefcase, label: "Позиция", value: [profile.desiredPosition, profile.level].filter(Boolean).join(" · ") },
    { icon: User, label: "Опыт", value: profile.experience },
    { icon: Star, label: "Навыки", value: profile.skills.join(", ") },
    { icon: GraduationCap, label: "Образование", value: profile.education },
    { icon: TrendingUp, label: "Сильные стороны", value: profile.strengths.join(", ") },
    { icon: Target, label: "Карьерные цели", value: profile.careerGoals },
  ].filter((s) => s.value);

  if (sections.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль кандидата</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <div key={section.label} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center">
              <section.icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-0.5">{section.label}</p>
              <p className="text-[13px] text-gray-700 dark:text-gray-300 break-words leading-relaxed">{section.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
