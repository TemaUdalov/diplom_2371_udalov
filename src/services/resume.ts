import { CandidateProfile } from "@/types";

/** Генерирует текстовое резюме на основе профиля кандидата */
export function generateResume(profile: CandidateProfile): string {
  const lines: string[] = [];

  // Позиция
  if (profile.desiredPosition) {
    lines.push(profile.desiredPosition.toUpperCase());
    if (profile.level) {
      lines.push(`Уровень: ${profile.level}`);
    }
    lines.push("");
  }

  // Опыт работы
  if (profile.experience) {
    lines.push("ОПЫТ РАБОТЫ");
    lines.push(profile.experience);
    lines.push("");
  }

  // Навыки
  if (profile.skills.length > 0) {
    lines.push("НАВЫКИ");
    lines.push(profile.skills.join(", "));
    lines.push("");
  }

  // Достижения
  if (profile.achievements.length > 0) {
    lines.push("ДОСТИЖЕНИЯ");
    profile.achievements.forEach((a, i) => {
      lines.push(`${i + 1}. ${a}`);
    });
    lines.push("");
  }

  // Образование
  if (profile.education) {
    lines.push("ОБРАЗОВАНИЕ");
    lines.push(profile.education);
    lines.push("");
  }

  // Сильные стороны
  if (profile.strengths.length > 0) {
    lines.push("СИЛЬНЫЕ СТОРОНЫ");
    lines.push(profile.strengths.join(", "));
    lines.push("");
  }

  // Карьерные цели
  if (profile.careerGoals) {
    lines.push("КАРЬЕРНЫЕ ЦЕЛИ");
    lines.push(profile.careerGoals);
    lines.push("");
  }

  // Мотивация
  if (profile.motivation) {
    lines.push("МОТИВАЦИЯ");
    lines.push(profile.motivation);
    lines.push("");
  }

  return lines.join("\n").trim();
}
