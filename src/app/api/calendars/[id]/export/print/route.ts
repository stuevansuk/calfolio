import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  fetchCalendarProjectWithPages,
  fetchProfile,
  updateProfileAdmin,
  updateCalendarProject,
} from "@/lib/db/api";
import { canPerformAction, shouldResetMonthlyCounters, getNextMonthlyReset } from "@/lib/tier-check";
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

  const rl = checkRateLimit(session.user.id, "export");
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

  // Reset monthly counters if needed
  if (shouldResetMonthlyCounters(profile.monthlyCounterResetAt)) {
    await updateProfileAdmin(session.user.id, {
      monthlyExportsUsed: 0,
      monthlyCalendarsCreated: 0,
      monthlyCounterResetAt: getNextMonthlyReset(),
    });
    profile.monthlyExportsUsed = 0;
  }

  const tierCheck = canPerformAction(
    profile as unknown as UserProfile,
    "exportPdf"
  );
  if (!tierCheck.allowed) {
    return NextResponse.json(
      { success: false, error: tierCheck.reason },
      { status: 403 }
    );
  }

  const project = await fetchCalendarProjectWithPages(id, session.user.id);
  if (!project) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  // Increment export counters
  await updateProfileAdmin(session.user.id, {
    monthlyExportsUsed: profile.monthlyExportsUsed + 1,
    totalExportsUsed: profile.totalExportsUsed + 1,
  });

  // Update project last exported
  await updateCalendarProject(id, session.user.id, {
    lastExportedAt: new Date(),
    status: "completed",
  });

  // TODO: Server-side PDF generation with Sharp + pdf-lib
  // For now, return data for client-side generation
  return NextResponse.json({
    success: true,
    data: {
      project,
      renderMode: "print",
      dpi: 300,
    },
  });
}
