import fs from "node:fs";
import path from "node:path";
import type { StorageProvider } from "./types";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export class LocalStorageProvider implements StorageProvider {
  async uploadImage(
    file: Buffer,
    key: string,
    contentType: string
  ): Promise<{ publicUrl: string; storageKey: string }> {
    const filePath = path.join(UPLOADS_DIR, key);
    ensureDir(filePath);
    fs.writeFileSync(filePath, file);

    // Write a small metadata file alongside for content-type
    fs.writeFileSync(filePath + ".meta", contentType);

    return {
      publicUrl: `/api/images/serve/${key.split("/").map(encodeURIComponent).join("/")}`,
      storageKey: key,
    };
  }

  async getPresignedUploadUrl(): Promise<null> {
    // Local storage doesn't use presigned URLs — client uploads via our API
    return null;
  }

  async deleteImage(key: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, key);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(filePath + ".meta")) fs.unlinkSync(filePath + ".meta");
    } catch {
      // Best-effort delete
    }
  }
}
