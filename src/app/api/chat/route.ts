import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/services/chat";
import { ChatRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const result = await processMessage(body.messages, body.jobDescription, body.profile);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Ошибка при обработке сообщения" }, { status: 500 });
  }
}
