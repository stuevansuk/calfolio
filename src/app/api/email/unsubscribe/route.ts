import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHmac } from "crypto";

function verifyToken(token: string, userId: string): boolean {
  const secret = process.env.BETTER_AUTH_SECRET!;
  const expected = createHmac("sha256", secret).update(userId).digest("hex");
  return token === expected;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const userId = searchParams.get("uid");

  if (!token || !userId || !verifyToken(token, userId)) {
    return new NextResponse(
      "<html><body><h1>Invalid unsubscribe link</h1></body></html>",
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  await db
    .update(profiles)
    .set({ emailUnsubscribed: true, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));

  return new NextResponse(
    `<html><body style="font-family:sans-serif;text-align:center;padding:60px;">
      <h1>Unsubscribed</h1>
      <p>You have been successfully unsubscribed from Calfolio emails.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
