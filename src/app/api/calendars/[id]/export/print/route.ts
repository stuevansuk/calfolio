import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
import { generatePrintPdfKey } from "@/lib/r2/client";
import type { UserProfile, TemplateConfig, CalendarProject, CalendarPage } from "@/types";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

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

  // Upload to R2
  const r2Key = generatePrintPdfKey(id);
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );
  } catch (err) {
    console.error("R2 upload failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to store PDF" },
      { status: 500 }
    );
  }

  const pdfUrl = `${PUBLIC_URL}/${r2Key}`;

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
