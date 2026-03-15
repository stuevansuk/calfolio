import { NextResponse } from "next/server";
import { fetchTemplate } from "@/lib/db/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = await fetchTemplate(id);

  if (!template) {
    return NextResponse.json(
      { success: false, error: "Template not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: template });
}
