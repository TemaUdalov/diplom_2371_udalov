import { NextRequest, NextResponse } from "next/server";
import { assessMatch } from "@/services/chat";
import { AssessmentRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: AssessmentRequest = await req.json();
    const result = await assessMatch(body.jobDescription, body.profile, body.messages);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Assess error:", err);
    return NextResponse.json({ error: "Ошибка при оценке" }, { status: 500 });
  }
}

export const maxDuration = 300;
