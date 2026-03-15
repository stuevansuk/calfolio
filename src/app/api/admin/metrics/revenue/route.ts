import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { printOrders, profiles } from "@/lib/db/schema";
import { count, sum, sql, eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const [orderRevenue] = await db
    .select({
      totalOrders: count(),
      totalRevenue: sum(printOrders.retailPriceCents),
      totalCost: sum(printOrders.wholesalePriceCents),
    })
    .from(printOrders)
    .where(eq(printOrders.stripePaymentStatus, "succeeded"));

  const [subscribers] = await db
    .select({
      hobby: sql<number>`COUNT(CASE WHEN tier = 'hobby' THEN 1 END)`,
      pro: sql<number>`COUNT(CASE WHEN tier = 'pro' THEN 1 END)`,
    })
    .from(profiles);

  return NextResponse.json({
    success: true,
    data: {
      printOrders: {
        totalOrders: orderRevenue.totalOrders,
        totalRevenueCents: Number(orderRevenue.totalRevenue) || 0,
        totalCostCents: Number(orderRevenue.totalCost) || 0,
        marginCents:
          (Number(orderRevenue.totalRevenue) || 0) -
          (Number(orderRevenue.totalCost) || 0),
      },
      subscribers,
    },
  });
}
