import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

// GET /api/sessions/:id — get a session by id (owner only)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const session = await prisma.generationSession.findUnique({
    where: { id: params.id },
    include: { chatMessages: { orderBy: { timestamp: "asc" } } },
  });

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json(session);
}

// DELETE /api/sessions/:id — delete a session (owner only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const session = await prisma.generationSession.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  await prisma.generationSession.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
