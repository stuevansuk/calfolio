import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchProfile, countImageUploads, insertImageUpload } from "@/lib/db/api";
import { canPerformAction } from "@/lib/tier-check";
import {
  generateStorageKey,
  getImageUrl,
  isR2,
  uploadImage,
  getPresignedUploadUrl,
} from "@/lib/storage";
import { IMAGE_CONSTRAINTS } from "@/lib/constants";
import { z } from "zod/v4";
import type { UserProfile } from "@/types";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

const MAX_FILE_SIZE = IMAGE_CONSTRAINTS.maxFileSizeMB * 1024 * 1024;

// Schema for R2 presign mode (JSON body)
const presignSchema = z.object({
  projectId: z.string().uuid(),
  filename: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  sizeBytes: z.number().int().min(1).max(MAX_FILE_SIZE),
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

  if (isR2()) {
    return handleR2Upload(request, session.user.id);
  } else {
    return handleLocalUpload(request, session.user.id);
  }
}

async function handleR2Upload(request: NextRequest, userId: string) {
  const body = await request.json();
  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const storageKey = generateStorageKey(
    userId,
    parsed.data.projectId,
    parsed.data.filename
  );

  const presigned = await getPresignedUploadUrl(storageKey, parsed.data.mimeType);
  if (!presigned) {
    return NextResponse.json(
      { success: false, error: "Failed to create upload URL" },
      { status: 500 }
    );
  }

  // Track the upload — orphan expiry only (assigned images persist forever)
  await insertImageUpload({
    userId,
    projectId: parsed.data.projectId,
    r2Key: storageKey,
    originalFilename: parsed.data.filename,
    mimeType: parsed.data.mimeType,
    sizeBytes: parsed.data.sizeBytes,
    expiresAt: new Date(
      Date.now() + IMAGE_CONSTRAINTS.orphanExpiryHours * 60 * 60 * 1000
    ),
  });

  return NextResponse.json({
    success: true,
    data: {
      uploadUrl: presigned.uploadUrl,
      storageKey,
      publicUrl: presigned.publicUrl,
    },
  });
}

async function handleLocalUpload(request: NextRequest, userId: string) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file || !projectId) {
    return NextResponse.json(
      { success: false, error: "Missing file or projectId" },
      { status: 400 }
    );
  }

  // Validate UUID format for projectId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId)) {
    return NextResponse.json(
      { success: false, error: "Invalid projectId" },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: `File too large. Maximum ${IMAGE_CONSTRAINTS.maxFileSizeMB}MB` },
      { status: 400 }
    );
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return NextResponse.json(
      { success: false, error: "Unsupported file type. Use JPEG, PNG, WebP, or HEIC" },
      { status: 400 }
    );
  }

  const storageKey = generateStorageKey(userId, projectId, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { publicUrl } = await uploadImage(buffer, storageKey, file.type);

  // Track the upload
  await insertImageUpload({
    userId,
    projectId,
    r2Key: storageKey,
    originalFilename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    expiresAt: new Date(
      Date.now() + IMAGE_CONSTRAINTS.orphanExpiryHours * 60 * 60 * 1000
    ),
  });

  return NextResponse.json({
    success: true,
    data: {
      storageKey,
      publicUrl,
    },
  });
}
