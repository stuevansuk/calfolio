import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { bulkUpdateCalendarPages, fetchCalendarProject } from "@/lib/db/api";
import { z } from "zod/v4";
import { BATCH_SIZES } from "@/lib/constants";

const pageUpdateSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    imageKey: z.string().max(500).nullable().optional(),
    imageUrl: z.string().max(500).nullable().optional(),
    imagePosition: z.record(z.string(), z.unknown()).nullable().optional(),
    imageCropData: z.record(z.string(), z.unknown()).nullable().optional(),
    overlayText: z.string().max(500).nullable().optional(),
    textStyle: z.record(z.string(), z.unknown()).nullable().optional(),
    backgroundColor: z.string().max(50).nullable().optional(),
    layoutVariant: z.string().max(100).nullable().optional(),
  }),
});

const bulkSchema = z.object({
  updates: z.array(pageUpdateSchema).min(1).max(BATCH_SIZES.pageUpdate),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  // IDOR: verify project ownership
  const project = await fetchCalendarProject(id, session.user.id);
  if (!project) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const results = await bulkUpdateCalendarPages(
    session.user.id,
    parsed.data.updates
  );

  return NextResponse.json({ success: true, data: results });
}
