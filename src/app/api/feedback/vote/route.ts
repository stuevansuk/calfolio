import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  checkFeedbackVote,
  insertFeedbackVote,
  deleteFeedbackVote,
} from "@/lib/db/api";
import { z } from "zod/v4";

const voteSchema = z.object({
  feedbackId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(session.user.id, "feedback");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const existing = await checkFeedbackVote(
    parsed.data.feedbackId,
    session.user.id
  );
  if (existing) {
    return NextResponse.json(
      { success: false, error: "Already voted" },
      { status: 409 }
    );
  }

  await insertFeedbackVote(parsed.data.feedbackId, session.user.id);
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  await deleteFeedbackVote(parsed.data.feedbackId, session.user.id);
  return NextResponse.json({ success: true });
}
