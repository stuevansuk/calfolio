import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { updateCalendarPage, fetchCalendarProject, markImageAssigned } from "@/lib/db/api";
import { z } from "zod/v4";

const patchSchema = z.object({
  imageKey: z.string().max(500).nullable().optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  imagePosition: z.record(z.string(), z.unknown()).nullable().optional(),
  imageCropData: z.record(z.string(), z.unknown()).nullable().optional(),
  overlayText: z.string().max(500).nullable().optional(),
  textStyle: z.record(z.string(), z.unknown()).nullable().optional(),
  backgroundColor: z.string().max(50).nullable().optional(),
  layoutVariant: z.string().max(100).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
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

  const { id, pageId } = await params;

  // IDOR: verify project ownership
  const project = await fetchCalendarProject(id, session.user.id);
  if (!project) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const updated = await updateCalendarPage(pageId, session.user.id, parsed.data);
  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  // Mark image as assigned (clears orphan expiry) so it persists forever
  if (parsed.data.imageKey) {
    await markImageAssigned(parsed.data.imageKey, session.user.id);
  }

  return NextResponse.json({ success: true, data: updated });
}
