import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IMAGE_CONSTRAINTS } from "@/lib/constants";
import type { StorageProvider } from "./types";

let _s3: S3Client | null = null;

function getS3(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _s3;
}

function getBucket(): string {
  return process.env.R2_BUCKET_NAME!;
}

function getPublicUrl(): string {
  return process.env.R2_PUBLIC_URL!;
}

export class R2StorageProvider implements StorageProvider {
  async uploadImage(
    file: Buffer,
    key: string,
    contentType: string
  ): Promise<{ publicUrl: string; storageKey: string }> {
    await getS3().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );

    return {
      publicUrl: `${getPublicUrl()}/${key}`,
      storageKey: key,
    };
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(getS3(), command, {
      expiresIn: IMAGE_CONSTRAINTS.presignExpirySeconds,
    });

    return {
      uploadUrl,
      publicUrl: `${getPublicUrl()}/${key}`,
    };
  }

  async deleteImage(key: string): Promise<void> {
    await getS3().send(
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    );
  }
}

// Re-export utility functions that the print route needs
export async function headR2Object(
  r2Key: string
): Promise<{ exists: boolean; contentLength?: number }> {
  try {
    const response = await getS3().send(
      new HeadObjectCommand({
        Bucket: getBucket(),
        Key: r2Key,
      })
    );
    return { exists: true, contentLength: response.ContentLength };
  } catch {
    return { exists: false };
  }
}

export async function getR2Object(r2Key: string) {
  const response = await getS3().send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: r2Key,
    })
  );
  return response;
}

export function getR2PublicUrl(): string {
  return getPublicUrl();
}

export function getR2S3Client(): S3Client {
  return getS3();
}

export function getR2BucketName(): string {
  return getBucket();
}
