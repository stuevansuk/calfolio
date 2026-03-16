import type { StorageProvider } from "./types";

let provider: StorageProvider | null = null;

async function getProvider(): Promise<StorageProvider> {
  if (provider) return provider;

  if (process.env.STORAGE_PROVIDER === "r2") {
    const { R2StorageProvider } = await import("./r2");
    provider = new R2StorageProvider();
  } else {
    const { LocalStorageProvider } = await import("./local");
    provider = new LocalStorageProvider();
  }

  return provider;
}

export async function uploadImage(
  file: Buffer,
  key: string,
  contentType: string
): Promise<{ publicUrl: string; storageKey: string }> {
  const p = await getProvider();
  return p.uploadImage(file, key, contentType);
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string } | null> {
  const p = await getProvider();
  return p.getPresignedUploadUrl(key, contentType);
}

export async function deleteImage(key: string): Promise<void> {
  const p = await getProvider();
  return p.deleteImage(key);
}

export function getImageUrl(key: string): string {
  // For R2, use public URL; for local, use the serve route
  if (process.env.STORAGE_PROVIDER === "r2") {
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
  return `/api/images/serve/${encodeURIComponent(key)}`;
}

export function generateStorageKey(
  userId: string,
  projectId: string,
  filename: string
): string {
  const ext = filename.split(".").pop() || "jpg";
  const uuid = crypto.randomUUID();
  return `${userId}/${projectId}/${uuid}.${ext}`;
}

export function generatePrintPdfKey(orderId: string): string {
  return `print-pdfs/${orderId}.pdf`;
}

export function isR2(): boolean {
  return process.env.STORAGE_PROVIDER === "r2";
}
