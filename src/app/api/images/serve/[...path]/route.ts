import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const MIME_FALLBACK: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Only serve when using local storage
  if (process.env.STORAGE_PROVIDER === "r2") {
    return NextResponse.json(
      { success: false, error: "Not available" },
      { status: 404 }
    );
  }

  const { path: segments } = await params;
  const key = decodeURIComponent(segments.join("/"));

  // Prevent path traversal
  const resolved = path.resolve(UPLOADS_DIR, key);
  if (!resolved.startsWith(UPLOADS_DIR)) {
    return NextResponse.json(
      { success: false, error: "Invalid path" },
      { status: 400 }
    );
  }

  if (!fs.existsSync(resolved)) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(resolved);

  // Read content type from metadata file, fallback to extension
  let contentType = "image/jpeg";
  const metaPath = resolved + ".meta";
  if (fs.existsSync(metaPath)) {
    contentType = fs.readFileSync(metaPath, "utf-8").trim();
  } else {
    const ext = path.extname(resolved).slice(1).toLowerCase();
    contentType = MIME_FALLBACK[ext] || "image/jpeg";
  }

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(fileBuffer.length),
    },
  });
}
