import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IMAGE_CONSTRAINTS } from "@/lib/constants";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function createPresignedUploadUrl(
  r2Key: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: IMAGE_CONSTRAINTS.presignExpirySeconds,
  });

  return {
    uploadUrl,
    publicUrl: `${PUBLIC_URL}/${r2Key}`,
  };
}

export async function deleteR2Object(r2Key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: r2Key,
    })
  );
}

export async function headR2Object(
  r2Key: string
): Promise<{ exists: boolean; contentLength?: number }> {
  try {
    const response = await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
      })
    );
    return { exists: true, contentLength: response.ContentLength };
  } catch {
    return { exists: false };
  }
}

export async function getR2Object(r2Key: string) {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: r2Key,
    })
  );
  return response;
}

export function generateR2Key(
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
