import {
  AnalysisRequest,
  AnsweredQuestion,
  CandidateData,
  CandidateProfile,
  ClarifyingQuestion,
  GenerateResult,
} from "@/types";
import { openai, MODEL } from "@/lib/openai";

/** Анализирует вакансию и данные кандидата, возвращает уточняющие вопросы */
export async function generateQuestions(
  request: AnalysisRequest
): Promise<ClarifyingQuestion[]> {
  const prompt = `Ты — HR-ассистент. Помоги кандидату подготовить отклик на вакансию.

Сгенерируй 5 уточняющих вопросов для кандидата.

ВАКАНСИЯ:
${request.jobDescription}

ДАННЫЕ КАНДИДАТА:
- Имя: ${request.candidate.name}
- Позиция: ${request.candidate.desiredPosition}
- Опыт: ${request.candidate.experience}
- Навыки: ${request.candidate.skills}
- Образование: ${request.candidate.education}
- Достижения: ${request.candidate.achievements}

Вопросы должны помочь улучшить резюме кандидата.
Пиши на русском языке.

Ответь JSON:
{"questions": [{"id": "q1", "question": "текст"}, {"id": "q2", "question": "текст"}, {"id": "q3", "question": "текст"}, {"id": "q4", "question": "текст"}, {"id": "q5", "question": "текст"}]}`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: "Ты HR-ассистент. Отвечай ТОЛЬКО валидным JSON на русском языке.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || '{"questions":[]}';
  const parsed = JSON.parse(raw);

  return (parsed.questions || []).map(
    (q: { id?: string; question: string }, i: number) => ({
      id: q.id || `q${i + 1}`,
      question: q.question,
    })
  );
}

function prefillResume(
  candidate: CandidateData,
  answers: AnsweredQuestion[],
  profile?: CandidateProfile
): string {
  const name = candidate.name;
  const position = profile?.desiredPosition || candidate.desiredPosition;
  const level = profile?.level || "";
  const experience = profile?.experience || candidate.experience;
  const skills = profile ? profile.skills.join(", ") : candidate.skills;
  const education = candidate.education;
  const strengths = profile ? profile.strengths.join(", ") : "";
  const weaknesses = profile?.weaknesses?.length ? profile.weaknesses.join(", ") : "";
  const careerGoals = profile?.careerGoals || "";
  const motivation = profile?.motivation || "";

  const achievementsRaw = profile
    ? profile.achievements
    : candidate.achievements.split(/[;•\n]/).map((s) => s.trim()).filter(Boolean);
  const achievements = (Array.isArray(achievementsRaw) ? achievementsRaw : [achievementsRaw])
    .filter((a) => typeof a === "string" && a.trim().length > 3);

  const extraInfo = answers
    .filter((a) => a.answer.trim())
    .map((a) => `${a.question}: ${a.answer}`)
    .join("\n");

  const sections: string[] = [];

  sections.push(name);

  // ПРОФИЛЬ — short summary (AI will rewrite this)
  let profileText = position;
  if (level) profileText = `${level} ${profileText}`;
  if (experience) profileText += `. Опыт: ${experience}`;
  if (careerGoals) profileText += `. ${careerGoals}`;
  if (motivation) profileText += `. ${motivation}`;
  sections.push(`ПРОФИЛЬ\n${profileText}`);

  // КОМПЕТЕНЦИИ
  const competencies: string[] = [];
  if (skills) competencies.push(`Технические навыки: ${skills}`);
  if (strengths) competencies.push(`Личные качества: ${strengths}`);
  if (competencies.length > 0) sections.push(`КОМПЕТЕНЦИИ\n${competencies.join("\n")}`);

  // ОПЫТ РАБОТЫ — use experience, don't repeat skills
  if (experience) sections.push(`ОПЫТ РАБОТЫ\n${experience}`);

  // ОБРАЗОВАНИЕ
  if (education) sections.push(`ОБРАЗОВАНИЕ\n${education}`);

  // ДОСТИЖЕНИЯ
  if (achievements.length > 0) {
    sections.push(`ДОСТИЖЕНИЯ\n${achievements.map((a) => `- ${a}`).join("\n")}`);
  }

  // Extra from Q&A
  if (extraInfo) sections.push(`ДОПОЛНИТЕЛЬНО\n${extraInfo}`);

  if (weaknesses) sections.push(`ЗОНЫ РАЗВИТИЯ\n${weaknesses}`);

  return sections.join("\n\n");
}

function prefillCoverLetter(
  candidate: CandidateData,
  jobDescription: string,
  profile?: CandidateProfile
): string {
  const name = candidate.name;
  const position = profile?.desiredPosition || candidate.desiredPosition;
  const experience = profile?.experience || candidate.experience;
  const motivation = profile?.motivation || "";

  return `Уважаемый руководитель!

Меня заинтересовала вакансия ${position} в вашей компании.

${experience ? `Мой опыт: ${experience}.` : ""}

${motivation || "Готов применить свои навыки и развиваться в вашей команде."}

Буду рад обсудить, как мой опыт может быть полезен. Готов к собеседованию.

С уважением,
${name}`;
}

async function polishText(text: string, jobDescription: string, task: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content: "Ты HR-редактор. Перепиши текст профессиональным языком. Пиши от лица кандидата. Без markdown. Только русский. Верни ТОЛЬКО готовый текст.",
      },
      {
        role: "user",
        content: `Вот черновик ${task}:\n\n${text}\n\nВакансия (ключевые слова):\n${jobDescription.slice(0, 400)}\n\nЗадача: перепиши секцию ПРОФИЛЬ как связный текст из 2-3 предложений. В остальных секциях исправь стиль и добавь ключевые слова из вакансии где уместно. Не придумывай новые факты. Верни полный текст.`,
      },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() || text;
}

/** Генерирует адаптированное резюме, сопроводительное письмо и рекомендации */
export async function generateResult(
  jobDescription: string,
  candidate: CandidateData,
  answers: AnsweredQuestion[],
  profile?: CandidateProfile
): Promise<GenerateResult> {
  const draftResume = prefillResume(candidate, answers, profile);
  const draftLetter = prefillCoverLetter(candidate, jobDescription, profile);

  console.log("Polishing resume...");
  console.log("Draft resume:\n", draftResume);
  const adaptedResume = await polishText(draftResume, jobDescription, "резюме кандидата");
  console.log("Resume done, polishing cover letter...");
  const coverLetter = await polishText(draftLetter, jobDescription, "сопроводительное письмо");
  console.log("Cover letter done, generating recommendations...");

  let recommendations: string[] = [];
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: "Напиши 5 коротких советов, каждый с новой строки. Без нумерации. Без markdown. Только русский.",
        },
        {
          role: "user",
          content: `Кандидат: ${candidate.desiredPosition}, опыт: ${candidate.experience}.\nВакансия: ${jobDescription.slice(0, 300)}\n\n5 советов как улучшить отклик:`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content || "";
    recommendations = raw
      .split("\n")
      .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((s) => s.length > 10);
  } catch (err) {
    console.error("Recommendations error:", err);
  }

  return {
    adaptedResume: adaptedResume || draftResume,
    coverLetter: coverLetter || draftLetter,
    recommendations: recommendations.length > 0
      ? recommendations
      : ["Добавьте конкретные цифры и результаты в описание опыта.",
         "Укажите технологии из вакансии, которыми вы владеете.",
         "Опишите свою роль в проектах подробнее.",
         "Покажите мотивацию к обучению и развитию.",
         "Адаптируйте резюме под каждую конкретную вакансию."],
  };
}
