import { CandidateProfile, CandidateData } from "@/types";

// ===== Interview Progress =====

const PROFILE_FIELDS: (keyof CandidateProfile)[] = [
  "desiredPosition",
  "level",
  "experience",
  "skills",
  "achievements",
  "education",
  "strengths",
  "weaknesses",
  "careerGoals",
  "motivation",
  "relevance",
];

/** Возвращает процент заполненности профиля (0–100) */
export function getProfileProgress(profile: CandidateProfile): { filled: number; total: number; percent: number } {
  const total = PROFILE_FIELDS.length;
  let filled = 0;

  for (const field of PROFILE_FIELDS) {
    const value = profile[field];
    if (Array.isArray(value)) {
      if (value.length > 0) filled++;
    } else if (typeof value === "string" && value.trim() !== "") {
      filled++;
    }
  }

  return { filled, total, percent: Math.round((filled / total) * 100) };
}

// ===== Interview Hints =====

interface InterviewHint {
  field: string;
  title: string;
  tips: string[];
}

const HINT_CONFIG: { field: keyof CandidateProfile; title: string; tips: string[] }[] = [
  {
    field: "desiredPosition",
    title: "Расскажите о желаемой позиции",
    tips: ["Название должности", "Уровень (junior/middle/senior)", "Направление работы"],
  },
  {
    field: "experience",
    title: "Опишите ваш опыт",
    tips: ["Где вы работали", "Сколько времени", "Какие задачи выполняли"],
  },
  {
    field: "skills",
    title: "Перечислите навыки",
    tips: ["Технологии и инструменты", "Языки программирования", "Soft skills"],
  },
  {
    field: "achievements",
    title: "Добавьте достижения",
    tips: ["Конкретные результаты", "Цифры или улучшения", "Награды и сертификаты"],
  },
  {
    field: "relevance",
    title: "Почему вы подходите?",
    tips: ["Релевантный опыт", "Совпадение с требованиями", "Ваша мотивация"],
  },
  {
    field: "strengths",
    title: "Расскажите о сильных сторонах",
    tips: ["Профессиональные качества", "Личные черты", "Примеры из практики"],
  },
];

/** Возвращает подсказку для первого незаполненного поля или null */
export function getInterviewHint(profile: CandidateProfile): InterviewHint | null {
  for (const hint of HINT_CONFIG) {
    const value = profile[hint.field];
    const isEmpty = Array.isArray(value) ? value.length === 0 : !value?.trim();
    if (isEmpty) {
      return { field: hint.field, title: hint.title, tips: hint.tips };
    }
  }
  return null;
}

/** Стартовое приветствие от ИИ (используется на клиенте) */
export function getGreeting(jobDescription: string): string {
  if (jobDescription.trim()) {
    return "Здравствуйте! Я ознакомился с вакансией. Расскажите, как вас зовут и на какую позицию вы претендуете?";
  }
  return "Здравствуйте! Расскажите, на какую позицию вы ищете работу?";
}

/** Конвертирует профиль из интервью в CandidateData (используется на клиенте) */
export function profileToCandidateData(
  profile: CandidateProfile,
  name: string
): CandidateData {
  return {
    name,
    desiredPosition: profile.desiredPosition,
    experience: profile.experience,
    skills: profile.skills.join(", "),
    education: profile.education,
    achievements: profile.achievements.join(". "),
    currentResume: "",
  };
}
