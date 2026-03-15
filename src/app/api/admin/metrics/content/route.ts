import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { calendarProjects } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const [statusBreakdown] = await db
    .select({
      draft: sql<number>`COUNT(CASE WHEN status = 'draft' THEN 1 END)`,
      completed: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
      ordered: sql<number>`COUNT(CASE WHEN status = 'ordered' THEN 1 END)`,
    })
    .from(calendarProjects);

  const [sizeBreakdown] = await db
    .select({
      a4: sql<number>`COUNT(CASE WHEN paper_size = 'A4' THEN 1 END)`,
      a5: sql<number>`COUNT(CASE WHEN paper_size = 'A5' THEN 1 END)`,
    })
    .from(calendarProjects);

  return NextResponse.json({
    success: true,
    data: { statusBreakdown, sizeBreakdown },
  });
}
