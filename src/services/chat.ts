import {
  ChatMessage,
  CandidateProfile,
  MatchScore,
} from "@/types";
import { openai, MODEL } from "@/lib/openai";
import { HR_KNOWLEDGE } from "@/lib/hrKnowledge";
import { getRAGContext } from "@/lib/rag";

const PROFILE_FIELDS = [
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
] as const;

function countFilledProfileFields(profile: CandidateProfile): number {
  return PROFILE_FIELDS.filter((key) => {
    const value = profile[key];
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === "string" && value.trim().length > 0;
  }).length;
}

function buildInterviewSystemPrompt(
  jobDescription: string,
  profile: CandidateProfile
): string {
  const hasJob = jobDescription.trim().length > 0;
  const filled = countFilledProfileFields(profile);

  // Build a simple list of what's filled and what's missing
  const filledFields: string[] = [];
  const missingFields: string[] = [];

  const fieldLabels: Record<string, string> = {
    desiredPosition: "позиция",
    level: "уровень",
    experience: "опыт",
    skills: "навыки",
    achievements: "достижения",
    education: "образование",
    strengths: "сильные стороны",
    weaknesses: "слабые стороны",
    careerGoals: "карьерные цели",
    motivation: "мотивация",
    relevance: "релевантность",
  };

  for (const key of PROFILE_FIELDS) {
    const value = profile[key];
    const isFilled = Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim().length > 0;
    if (isFilled) {
      filledFields.push(fieldLabels[key]);
    } else {
      missingFields.push(fieldLabels[key]);
    }
  }

  return `${HR_KNOWLEDGE}

Заполнено ${filled} из ${PROFILE_FIELDS.length} полей.
Уже заполнены: ${filledFields.join(", ") || "ничего"}
Ещё нужно узнать: ${missingFields.join(", ") || "всё заполнено"}

${hasJob ? `ВАКАНСИЯ:\n${jobDescription}\n` : "ВАКАНСИЯ: не указана\n"}

ЗАДАЙ ОДИН вопрос про: ${missingFields[0] || "подведи итог"}.
Сначала коротко отреагируй на ответ кандидата (1 предложение), потом задай вопрос.
Не больше 3-4 предложений. Без markdown. Только текст.`;
}

function buildProfileExtractionPrompt(
  messages: ChatMessage[],
  currentProfile: CandidateProfile,
  jobDescription: string
): string {
  const conversation = messages
    .map((m) => `${m.role === "user" ? "Кандидат" : "HR"}: ${m.content}`)
    .join("\n");

  return `Проанализируй диалог HR-интервью и извлеки данные кандидата.

ВАКАНСИЯ:
${jobDescription || "Не указана"}

ТЕКУЩИЙ ПРОФИЛЬ (уже извлечённые данные):
${JSON.stringify(currentProfile, null, 2)}

ДИАЛОГ:
${conversation}

ИНСТРУКЦИИ:
1. Прочитай ВСЕ сообщения кандидата внимательно.
2. Если кандидат назвал позицию — запиши в desiredPosition.
3. Если кандидат описал опыт работы — запиши в experience.
4. Если кандидат перечислил технологии, языки, инструменты — добавь в skills (массив строк).
5. Если кандидат упомянул достижения или результаты — добавь в achievements (массив строк).
6. Если кандидат упомянул образование — запиши в education.
7. Если кандидат описал сильные стороны или качества — добавь в strengths (массив строк).
8. Если кандидат упомянул слабые стороны — добавь в weaknesses (массив строк).
9. Если кандидат описал карьерные цели — запиши в careerGoals.
10. Если кандидат описал мотивацию — запиши в motivation.
11. Если можно определить релевантность опыта вакансии — запиши в relevance.
12. level определяй по стажу: <1 год = Junior, 1-3 года = Middle, 3+ = Senior.
13. Сохраняй уже существующие данные из текущего профиля, НЕ удаляй их.

ВАЖНО: Отвечай ТОЛЬКО валидным JSON без пояснений и markdown.

{
  "profile": {
    "desiredPosition": "строка или пустая строка",
    "level": "Junior/Middle/Senior или пустая строка",
    "experience": "строка или пустая строка",
    "skills": ["массив строк"],
    "achievements": ["массив строк"],
    "education": "строка или пустая строка",
    "strengths": ["массив строк"],
    "weaknesses": ["массив строк"],
    "careerGoals": "строка или пустая строка",
    "motivation": "строка или пустая строка",
    "relevance": "строка или пустая строка"
  }
}`;
}

function buildAssessMatchPrompt(
  jobDescription: string,
  profile: CandidateProfile,
  messages: ChatMessage[]
): string {
  const conversation = messages
    .filter((m) => m.role === "user")
    .slice(-5)
    .map((m) => m.content.slice(0, 300))
    .join("\n");

  return `Оцени соответствие кандидата вакансии.

ВАКАНСИЯ:
${(jobDescription || "Не указана").slice(0, 800)}

ДАННЫЕ КАНДИДАТА:
- Позиция: ${profile.desiredPosition || "не указана"}
- Уровень: ${profile.level || "не указан"}
- Опыт: ${profile.experience || "не указан"}
- Навыки: ${profile.skills?.join(", ") || "не указаны"}
- Достижения: ${profile.achievements?.join(", ") || "не указаны"}
- Образование: ${profile.education || "не указано"}
- Сильные стороны: ${profile.strengths?.join(", ") || "не указаны"}
${conversation ? `\nОТВЕТЫ КАНДИДАТА:\n${conversation}` : ""}

Ответь JSON. Вот ПРИМЕР правильного ответа (замени на реальные данные кандидата):

{"overall": 55, "strengths": ["Есть релевантный опыт работы с нужными технологиями", "Хорошая мотивация и желание развиваться", "Образование соответствует требованиям вакансии"], "gaps": ["Недостаточно коммерческого опыта для данной позиции", "Не хватает опыта работы в команде", "Нет измеримых достижений в резюме"], "resumeTips": ["Добавьте конкретные цифры и результаты в описание опыта", "Укажите технологии из вакансии, которыми вы владеете", "Опишите свою роль в проектах подробнее"], "coverLetterTips": ["Напишите, почему вас привлекает именно эта компания", "Приведите пример решения похожей задачи из вашего опыта", "Покажите мотивацию к обучению и развитию"]}

ПРАВИЛА:
- overall: число 0-100
- Каждый массив: 3-5 строк на русском
- Только JSON, без текста вокруг`;
}

function tryExtractJson(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  return match ? match[0] : "{}";
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(tryExtractJson(raw)) as T;
  } catch {
    return fallback;
  }
}

function uniqueStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)));
}

export async function processMessage(
  messages: ChatMessage[],
  jobDescription: string,
  profile: CandidateProfile
): Promise<{ reply: string; updatedProfile: CandidateProfile; interviewComplete: boolean }> {
  const chatMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  let reply = "Спасибо. Расскажите, пожалуйста, подробнее о вашем опыте и ключевых задачах.";

  // Fetch RAG context based on the last user message and job description
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const ragQuery = `${jobDescription.slice(0, 200)} ${lastUserMsg}`;
  const ragContext = await getRAGContext(ragQuery, 3);

  try {
    const systemPrompt = buildInterviewSystemPrompt(jobDescription, profile) +
      (ragContext ? `\n\nИспользуй эти знания из учебника для более профессиональных вопросов и советов:${ragContext}` : "");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...chatMessages,
      ],
    });

    reply = completion.choices[0]?.message?.content?.trim() || reply;
  } catch (err: unknown) {
    console.error("AI reply generation error:", err);

    const status = (err as { status?: number })?.status;
    if (status === 401) {
      throw new Error("Неверный API-ключ");
    }
    if (status === 402) {
      throw new Error("Недостаточно баланса или лимит провайдера исчерпан");
    }
    if (status === 429) {
      throw new Error("Слишком много запросов. Попробуйте чуть позже");
    }

    throw new Error("Не удалось получить ответ от AI");
  }

  const updatedProfile = { ...profile };
  let interviewComplete = false;

  // Include the AI's latest reply in messages for extraction context
  const messagesWithReply: ChatMessage[] = [
    ...messages,
    { id: "ai-reply", role: "assistant", content: reply, timestamp: Date.now() },
  ];

  try {
    const extraction = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Ты извлекаешь данные из диалога HR-интервью. Всегда отвечай ТОЛЬКО валидным JSON.",
        },
        {
          role: "user",
          content: buildProfileExtractionPrompt(messagesWithReply, profile, jobDescription),
        },
      ],
    });

    const raw = extraction.choices[0]?.message?.content || "{}";
    console.log("Profile extraction raw:", raw);
    const parsed = safeJsonParse<{
      profile?: Partial<CandidateProfile>;
      interviewComplete?: boolean;
    }>(raw, {});

    if (parsed.profile) {
      for (const key of PROFILE_FIELDS) {
        const val = parsed.profile[key];

        if (val === undefined || val === null || val === "") continue;

        if (Array.isArray(val)) {
          const merged = uniqueStringArray([
            ...((updatedProfile[key] as string[]) || []),
            ...val,
          ]);
          if (merged.length > 0) {
            (updatedProfile as Record<string, unknown>)[key] = merged;
          }
        } else if (typeof val === "string" && val.trim()) {
          (updatedProfile as Record<string, unknown>)[key] = val.trim();
        }
      }
    }

    interviewComplete = countFilledProfileFields(updatedProfile) >= PROFILE_FIELDS.length;
  } catch (error) {
    console.error("Profile extraction error:", error);
  }

  return { reply, updatedProfile, interviewComplete };
}

export async function assessMatch(
  jobDescription: string,
  profile: CandidateProfile,
  messages: ChatMessage[]
): Promise<MatchScore> {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Ты HR-эксперт. Отвечай ТОЛЬКО валидным JSON на русском языке.",
        },
        {
          role: "user",
          content: buildAssessMatchPrompt(jobDescription, profile, messages),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    console.log("Assessment raw:", raw);
    const parsed = safeJsonParse<Partial<MatchScore>>(raw, {});

    return {
      overall: Math.min(100, Math.max(0, Number(parsed.overall) || 50)),
      strengths: uniqueStringArray(parsed.strengths),
      gaps: uniqueStringArray(parsed.gaps),
      resumeTips: uniqueStringArray(parsed.resumeTips),
      coverLetterTips: uniqueStringArray(parsed.coverLetterTips),
    };
  } catch (error) {
    console.error("Match assessment error:", error);

    return {
      overall: 50,
      strengths: [],
      gaps: ["Не удалось получить точную AI-оценку"],
      resumeTips: [],
      coverLetterTips: [],
    };
  }
}