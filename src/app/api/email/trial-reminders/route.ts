import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  // TODO: Implement trial reminder emails via Resend
  return NextResponse.json({ success: true, data: { sent: 0 } });
}
