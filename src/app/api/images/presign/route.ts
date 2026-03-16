import { NextRequest, NextResponse } from "next/server";

// Redirect to the unified upload endpoint
export async function POST(request: NextRequest) {
  const url = new URL("/api/images/upload", request.url);
  return NextResponse.rewrite(url);
}
