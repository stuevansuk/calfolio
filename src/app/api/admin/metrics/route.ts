import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles, calendarProjects, printOrders } from "@/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const [users] = await db.select({ total: count() }).from(profiles);
  const [projects] = await db.select({ total: count() }).from(calendarProjects);
  const [orders] = await db.select({ total: count() }).from(printOrders);

  const [tierBreakdown] = await db
    .select({
      trial: sql<number>`COUNT(CASE WHEN tier = 'trial' THEN 1 END)`,
      hobby: sql<number>`COUNT(CASE WHEN tier = 'hobby' THEN 1 END)`,
      pro: sql<number>`COUNT(CASE WHEN tier = 'pro' THEN 1 END)`,
      free: sql<number>`COUNT(CASE WHEN tier = 'free' THEN 1 END)`,
    })
    .from(profiles);

  return NextResponse.json({
    success: true,
    data: {
      totalUsers: users.total,
      totalProjects: projects.total,
      totalOrders: orders.total,
      tierBreakdown,
    },
  });
}
