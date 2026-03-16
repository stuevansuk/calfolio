import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  fetchCalendarProjectWithPages,
  fetchProfile,
  fetchTemplate,
  updateProfileAdmin,
  updateCalendarProject,
} from "@/lib/db/api";
import { canPerformAction, shouldResetMonthlyCounters, getNextMonthlyReset } from "@/lib/tier-check";
import { generatePrintPdf } from "@/lib/pdf/print-generator";
import { uploadImage, generatePrintPdfKey, getImageUrl } from "@/lib/storage";
import type { UserProfile, TemplateConfig, CalendarProject, CalendarPage } from "@/types";

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

  // Fetch template config
  let templateConfig: TemplateConfig;
  if (project.templateId) {
    const template = await fetchTemplate(project.templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }
    templateConfig = template.config as TemplateConfig;
  } else {
    return NextResponse.json(
      { success: false, error: "Project has no template assigned" },
      { status: 400 }
    );
  }

  // Generate print-ready PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generatePrintPdf(
      project as unknown as CalendarProject,
      project.pages as unknown as CalendarPage[],
      templateConfig
    );
  } catch (err) {
    console.error("Print PDF generation failed:", err);
    return NextResponse.json(
      { success: false, error: "PDF generation failed" },
      { status: 500 }
    );
  }

  // Upload to storage
  const pdfKey = generatePrintPdfKey(id);
  try {
    await uploadImage(pdfBuffer, pdfKey, "application/pdf");
  } catch (err) {
    console.error("PDF storage upload failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to store PDF" },
      { status: 500 }
    );
  }

  const pdfUrl = getImageUrl(pdfKey);

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

  return NextResponse.json({
    success: true,
    data: {
      pdfUrl,
      renderMode: "print",
      dpi: 300,
    },
  });
}
