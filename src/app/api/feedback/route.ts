import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchFeedbackList, insertFeedback } from "@/lib/db/api";
import { isAdmin } from "@/lib/auth/session";
import { PAGINATION } from "@/lib/constants";
import { z } from "zod/v4";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(session.user.id, "api");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const my = searchParams.get("my") === "true";
  const status = searchParams.get("status") || undefined;
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(PAGINATION.defaultLimit)),
    PAGINATION.maxLimit
  );
  const offset = parseInt(searchParams.get("offset") || "0");

  const result = await fetchFeedbackList({
    userId: my ? session.user.id : undefined,
    status,
    limit,
    offset,
  });

  return NextResponse.json({ success: true, data: result });
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.enum(["feature", "bug", "improvement"]).optional(),
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const item = await insertFeedback({
    userId: session.user.id,
    ...parsed.data,
  });

  return NextResponse.json({ success: true, data: item }, { status: 201 });
}
