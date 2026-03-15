import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { count, sql, gte } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [activeLastWeek] = await db
    .select({ total: count() })
    .from(profiles)
    .where(gte(profiles.lastActiveAt, sevenDaysAgo));

  const [activeLastMonth] = await db
    .select({ total: count() })
    .from(profiles)
    .where(gte(profiles.lastActiveAt, thirtyDaysAgo));

  const [newUsersLastWeek] = await db
    .select({ total: count() })
    .from(profiles)
    .where(gte(profiles.createdAt, sevenDaysAgo));

  return NextResponse.json({
    success: true,
    data: {
      activeLastWeek: activeLastWeek.total,
      activeLastMonth: activeLastMonth.total,
      newUsersLastWeek: newUsersLastWeek.total,
    },
  });
}
