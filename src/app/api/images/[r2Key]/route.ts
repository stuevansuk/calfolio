import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { deleteImageUpload } from "@/lib/db/api";
import { deleteR2Object } from "@/lib/r2/client";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ r2Key: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(session.user.id, "api");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const { r2Key } = await params;
  const decodedKey = decodeURIComponent(r2Key);

  // IDOR via image_uploads table
  const deleted = await deleteImageUpload(decodedKey, session.user.id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  // Best-effort delete from R2
  try {
    await deleteR2Object(decodedKey);
  } catch (err) {
    console.error("Failed to delete from R2:", err);
  }

  return NextResponse.json({ success: true });
}
