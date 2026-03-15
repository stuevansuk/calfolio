import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ success: true, data: { status: "ok" } });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 503 }
    );
  }
}
