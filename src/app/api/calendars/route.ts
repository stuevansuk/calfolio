import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  fetchCalendarProjects,
  insertCalendarProject,
  insertCalendarPages,
  countCalendarProjects,
  fetchProfile,
  fetchTemplate,
} from "@/lib/db/api";
import { canPerformAction, getEffectiveTier } from "@/lib/tier-check";
import { CALENDAR, PAGINATION } from "@/lib/constants";
import { z } from "zod/v4";
import type { UserProfile } from "@/types";

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
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(PAGINATION.defaultLimit)),
    PAGINATION.maxLimit
  );
  const offset = parseInt(searchParams.get("offset") || "0");
  const status = searchParams.get("status") || undefined;

  const result = await fetchCalendarProjects(session.user.id, {
    limit,
    offset,
    status,
  });

  return NextResponse.json({ success: true, data: result });
}

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  templateId: z.string().min(1).max(100).optional(),
  calendarYear: z.number().int().min(2020).max(2100),
  startMonth: z.number().int().min(1).max(12).optional(),
  paperSize: z.enum(["A4", "A5"]).optional(),
  orientation: z.enum(["portrait", "landscape"]).optional(),
});

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

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

  // Check premium template access
  if (parsed.data.templateId) {
    const template = await fetchTemplate(parsed.data.templateId);
    if (template?.isPremium) {
      const premiumCheck = canPerformAction(
        profile as unknown as UserProfile,
        "usePremiumTemplate"
      );
      if (!premiumCheck.allowed) {
        return NextResponse.json(
          { success: false, error: premiumCheck.reason },
          { status: 403 }
        );
      }
    }
  }

  // Determine orientation from template if not explicitly set
  let orientation = parsed.data.orientation || "portrait";
  if (parsed.data.templateId && !parsed.data.orientation) {
    const template = await fetchTemplate(parsed.data.templateId);
    if (template) {
      const config = template.config as { orientation?: string };
      if (config.orientation) {
        orientation = config.orientation as "portrait" | "landscape";
      }
    }
  }

  // Create project
  const project = await insertCalendarProject({
    userId: session.user.id,
    title: parsed.data.title || "Untitled Calendar",
    templateId: parsed.data.templateId || null,
    calendarYear: parsed.data.calendarYear,
    startMonth: parsed.data.startMonth || 1,
    paperSize: parsed.data.paperSize || "A4",
    orientation,
  });

  // Create 13 page rows (cover + 12 months)
  const pages = Array.from({ length: CALENDAR.pagesPerProject }, (_, i) => ({
    projectId: project.id,
    userId: session.user.id,
    monthIndex: i,
    sortOrder: i,
  }));

  await insertCalendarPages(pages);

  return NextResponse.json({ success: true, data: project }, { status: 201 });
}
