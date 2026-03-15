import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  // Redirect to settings with session_id for client-side verification
  return NextResponse.redirect(
    new URL(`/app/settings?session_id=${sessionId}`, request.url)
  );
}
