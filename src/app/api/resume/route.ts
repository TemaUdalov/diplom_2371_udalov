import { NextRequest, NextResponse } from "next/server";
import { CandidateProfile } from "@/types";
import { generateResume } from "@/services/resume";

export async function POST(req: NextRequest) {
  try {
    const body: { profile: CandidateProfile } = await req.json();
    const text = generateResume(body.profile);
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Ошибка при генерации резюме" },
      { status: 500 }
    );
  }
}
