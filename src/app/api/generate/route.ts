import { NextRequest, NextResponse } from "next/server";
import { generateResult } from "@/services/ai";
import { GenerateRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();

    if (!body.jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Описание вакансии обязательно" },
        { status: 400 }
      );
    }

    const result = await generateResult(
      body.jobDescription,
      body.candidate,
      body.answers,
      body.profile
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Ошибка при генерации результатов" },
      { status: 500 }
    );
  }
}

export const maxDuration = 300;
