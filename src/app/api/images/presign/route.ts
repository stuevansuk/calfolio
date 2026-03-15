import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchProfile, countImageUploads, insertImageUpload } from "@/lib/db/api";
import { canPerformAction } from "@/lib/tier-check";
import { createPresignedUploadUrl, generateR2Key } from "@/lib/r2/client";
import { IMAGE_CONSTRAINTS } from "@/lib/constants";
import { z } from "zod/v4";
import type { UserProfile } from "@/types";

const presignSchema = z.object({
  projectId: z.string().uuid(),
  filename: z.string().min(1).max(255),
  mimeType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]),
  sizeBytes: z.number().int().min(1).max(IMAGE_CONSTRAINTS.maxFileSizeMB * 1024 * 1024),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(session.user.id, "imageUpload");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  // Tier check
  const profile = await fetchProfile(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profile not found" },
      { status: 404 }
    );
  }

  const currentUploads = await countImageUploads(session.user.id);
  const tierCheck = canPerformAction(
    profile as unknown as UserProfile,
    "uploadImage",
    currentUploads
  );
  if (!tierCheck.allowed) {
    return NextResponse.json(
      { success: false, error: tierCheck.reason },
      { status: 403 }
    );
  }

  const r2Key = generateR2Key(
    session.user.id,
    parsed.data.projectId,
    parsed.data.filename
  );

  const { uploadUrl, publicUrl } = await createPresignedUploadUrl(
    r2Key,
    parsed.data.mimeType
  );

  // Track the upload
  await insertImageUpload({
    userId: session.user.id,
    projectId: parsed.data.projectId,
    r2Key,
    originalFilename: parsed.data.filename,
    mimeType: parsed.data.mimeType,
    sizeBytes: parsed.data.sizeBytes,
    expiresAt: new Date(
      Date.now() + IMAGE_CONSTRAINTS.r2ExpiryHours * 60 * 60 * 1000
    ),
  });

  return NextResponse.json({
    success: true,
    data: { uploadUrl, r2Key, publicUrl },
  });
}
