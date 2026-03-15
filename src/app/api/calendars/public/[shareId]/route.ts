import { NextResponse } from "next/server";
import { fetchCalendarProjectByShareId } from "@/lib/db/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  const project = await fetchCalendarProjectByShareId(shareId);

  if (!project) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  // Sanitize: remove userId from response
  const { userId, ...sanitized } = project;
  const sanitizedPages = project.pages.map(({ userId: _, ...page }) => page);

  return NextResponse.json({
    success: true,
    data: { ...sanitized, pages: sanitizedPages },
  });
}
