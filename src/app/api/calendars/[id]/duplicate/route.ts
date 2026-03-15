import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  fetchCalendarProjectWithPages,
  insertCalendarProject,
  insertCalendarPages,
  countCalendarProjects,
  fetchProfile,
} from "@/lib/db/api";
import { canPerformAction } from "@/lib/tier-check";
import type { UserProfile } from "@/types";

export async function POST(
  _request: Request,
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

  // Tier check
  const profile = await fetchProfile(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profile not found" },
      { status: 404 }
    );
  }

  const currentCount = await countCalendarProjects(session.user.id);
  const tierCheck = canPerformAction(
    profile as unknown as UserProfile,
    "createCalendar",
    currentCount
  );
  if (!tierCheck.allowed) {
    return NextResponse.json(
      { success: false, error: tierCheck.reason },
      { status: 403 }
    );
  }

  const source = await fetchCalendarProjectWithPages(id, session.user.id);
  if (!source) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  const newProject = await insertCalendarProject({
    userId: session.user.id,
    title: `${source.title} (Copy)`,
    description: source.description,
    templateId: source.templateId,
    calendarYear: source.calendarYear,
    startMonth: source.startMonth,
    orientation: source.orientation,
    paperSize: source.paperSize,
    locale: source.locale,
  });

  const newPages = source.pages.map((page) => ({
    projectId: newProject.id,
    userId: session.user.id,
    monthIndex: page.monthIndex,
    imageKey: page.imageKey,
    imageUrl: page.imageUrl,
    imagePosition: page.imagePosition,
    imageCropData: page.imageCropData,
    overlayText: page.overlayText,
    textStyle: page.textStyle,
    backgroundColor: page.backgroundColor,
    layoutVariant: page.layoutVariant,
    sortOrder: page.sortOrder,
  }));

  await insertCalendarPages(newPages);

  return NextResponse.json(
    { success: true, data: newProject },
    { status: 201 }
  );
}
