import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { insertExitSurvey } from "@/lib/db/api";
import { z } from "zod/v4";

const surveySchema = z.object({
  reason: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = surveySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  await insertExitSurvey({
    userId: session.user.id,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  return NextResponse.json({ success: true });
}
