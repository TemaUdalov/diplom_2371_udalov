import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/services/ai";
import { AnalysisRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();

    if (!body.jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Описание вакансии обязательно" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(body);
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json(
      { error: "Ошибка при анализе данных" },
      { status: 500 }
    );
  }
}
