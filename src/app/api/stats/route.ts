import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [sessionsCount, usersCount] = await Promise.all([
      prisma.generationSession.count(),
      prisma.user.count(),
    ]);

    return NextResponse.json({ sessionsCount, usersCount });
  } catch {
    return NextResponse.json({ sessionsCount: 0, usersCount: 0 });
  }
}
