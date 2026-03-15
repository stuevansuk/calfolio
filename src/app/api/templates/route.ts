import { NextRequest, NextResponse } from "next/server";
import { fetchTemplates } from "@/lib/db/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;

  const templates = await fetchTemplates({ category });
  return NextResponse.json({ success: true, data: templates });
}
