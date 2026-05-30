import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

// GET /api/sessions — list user's sessions
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const sessions = await prisma.generationSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      candidateName: true,
      matchScore: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(sessions);
}

// POST /api/sessions — create a new session
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const session = await prisma.generationSession.create({
      data: {
        userId,
        title: body.title || "Без названия",
        jobDescription: body.jobDescription || "",
        candidateName: body.candidateName || "",
        adaptedResume: body.adaptedResume,
        coverLetter: body.coverLetter,
        recommendations: body.recommendations || [],
        matchScore: body.matchScore,
        matchStrengths: body.matchStrengths || [],
        matchGaps: body.matchGaps || [],
        resumeTips: body.resumeTips || [],
        coverLetterTips: body.coverLetterTips || [],
        profileData: body.profileData,
        chatMessages: body.chatMessages?.length
          ? {
              create: body.chatMessages.map(
                (m: { role: string; content: string; timestamp?: number }) => ({
                  role: m.role,
                  content: m.content,
                  timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
                })
              ),
            }
          : undefined,
      },
    });

    return NextResponse.json({ id: session.id });
  } catch {
    return NextResponse.json({ error: "Ошибка при сохранении" }, { status: 500 });
  }
}
